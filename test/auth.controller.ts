import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { IUserModel } from '../server/api/models/user';
import { UserBuilder } from './user.builder';
import { initDatabase, dropDatabase, createUser, loginUser } from './controller.utils';
import { UserService } from '../server/api/services/user.service';


describe('Auth', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });
    it('should reject deleted user', async () => {
        const rundata = await loginUser();
        
        await new UserService().deleteByName(rundata.user.username);

        return request(Server)
            .post('/api/v1/login')
            .send({ username: rundata.user.username, password: rundata.password })
            .expect(HttpStatus.UNAUTHORIZED)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .that.has.property('message')
                    .to.equal('invalid password');
            });
    });
    it('should reject wrong password', async () => {
        let password: string;
        const testuser = UserBuilder.default(p => password = p);
        testuser.save();

        return request(Server)
            .post('/api/v1/login')
            .send({ username: testuser.username, password: '_' })
            .expect(HttpStatus.UNAUTHORIZED)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .that.has.property('message')
                    .to.equal('invalid password');
            });
    });

    it('should reject wrong username', async () => {
        let password: string;
        const testuser = UserBuilder.default(p => password = p);
        testuser.save();

        return request(Server)
            .post('/api/v1/login')
            .send({ username: '_', password })
            .expect(HttpStatus.UNAUTHORIZED)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .that.has.property('message')
                    .to.equal('invalid password');
            });
    });

    it('should login a user', async () => {
        let password: string;
        const testuser = UserBuilder.default(p => password = p);
        testuser.save();

        return request(Server)
            .post('/api/v1/login')
            .send({ username: testuser.username, password })
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .that.has.property('token');
            });
    });

    it('should send user details after login', async () => {
        const rundata = await createUser();
        await loginUser(rundata);

        return request(Server)
            .get('/api/v1/login')
            .set('Authorization', 'bearer ' + rundata.token)
            .send()
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .to.eql({
                        username: rundata.user.username,
                        fullname: rundata.user.fullname
                    });
            });
    });

    it('should repond with 401 when not authorized', async () => {
        const rundata = await createUser();
        await loginUser(rundata);

        return request(Server)
            .get('/api/v1/login')
            .send()
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should logout with status 200', async () => {
        return request(Server)
            .post('/api/v1/logout')
            .send()
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .to.have.property('message');
            });
    });

    it('should send tokens in a known format', async () => {
        const firstUser = await createUser();
        await loginUser(firstUser);

        const otherUser = await loginUser();

        const firstUserTokenParts = firstUser.token.split('.');
        const otherUserTokenParts = otherUser.token.split('.');

        const firstUserpayload = JSON.parse((new Buffer(firstUserTokenParts[1], 'base64')).toString('ascii'));
        const otherUserpayload = JSON.parse((new Buffer(otherUserTokenParts[1], 'base64')).toString('ascii'));

        const firstUserIdFromToken = firstUserpayload.id;
        const otherUserIdFromToken = otherUserpayload.id;

        expect(otherUser.token).to.not.equal(firstUser.token);
        expect(firstUserTokenParts).to.be.an('array').of.lengthOf(3);
        expect(otherUserTokenParts).to.be.an('array').of.lengthOf(3);
        expect(firstUserIdFromToken).to.equal(String(firstUser.user._id));
        expect(otherUserIdFromToken).to.equal(String(otherUser.user._id));
        expect(firstUserIdFromToken).to.not.be.equal(otherUserIdFromToken);
    });

    it('should detect a modified field within the token', async () => {
        const firstUser = await createUser();
        await loginUser(firstUser);

        const otherUser = await loginUser();

        const firstUserTokenParts = firstUser.token.split('.');
        const otherUserTokenParts = otherUser.token.split('.');

        const firstUserpayload = JSON.parse((new Buffer(firstUserTokenParts[1], 'base64')).toString('ascii'));
        const otherUserpayload = JSON.parse((new Buffer(otherUserTokenParts[1], 'base64')).toString('ascii'));

        otherUserpayload.id = firstUserpayload.id;
        otherUserTokenParts[1] = new Buffer(JSON.stringify(otherUserpayload)).toString('base64');

        const fakeToken1 = otherUserTokenParts.join('.');

        return request(Server)
            .get('/api/v1/login')
            .set('Authorization', 'bearer ' + fakeToken1)
            .send()
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should detect tampered tokens', async () => {
        const firstUser = await createUser();
        await loginUser(firstUser);

        const otherUser = await loginUser();

        const firstUserTokenParts = firstUser.token.split('.');
        const otherUserTokenParts = otherUser.token.split('.');

        const firstUserpayload = JSON.parse((new Buffer(firstUserTokenParts[1], 'base64')).toString('ascii'));
        const otherUserpayload = JSON.parse((new Buffer(otherUserTokenParts[1], 'base64')).toString('ascii'));

        otherUserpayload.id = firstUserpayload.id;
        otherUserTokenParts[1] = new Buffer(JSON.stringify(otherUserpayload)).toString('base64');

        const fakeToken2 = ([otherUserTokenParts[0], firstUserTokenParts[1], otherUserTokenParts[2]]).join('.');

        return request(Server)
            .get('/api/v1/login')
            .set('Authorization', 'bearer ' + fakeToken2)
            .send()
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should detect invalid signature', async () => {
        const firstUser = await createUser();
        await loginUser(firstUser);

        const otherUser = await loginUser();

        const otherUserTokenParts = otherUser.token.split('.');

        otherUserTokenParts[2] = 'M0ipMVcfpz-gYILPeVZ2Bvz0tXAaZEsK7NcYLl-8mLI';

        const fakeToken1 = otherUserTokenParts.join('.');

        return request(Server)
            .get('/api/v1/login')
            .set('Authorization', 'bearer ' + fakeToken1)
            .send()
            .expect(HttpStatus.UNAUTHORIZED);
    });
});