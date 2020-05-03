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
                        fullname: rundata.user.fullname,
                        groupId: rundata.user.groupId,
                        groupName: rundata.user.fullname,
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

});