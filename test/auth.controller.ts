import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { doesNotReject } from 'assert';
import { UserService } from '../server/api/services/user.service';
import { User, IUserModel } from '../server/api/models/user';
import Mongoose from '../server/common/mongoose';
import mongoose from 'mongoose';
import { UserBuilder } from './user.builder';

describe('Auth', () => {
    let db: Mongoose;
    before(async () => {
        const d = new Date();
        process.env.MONGO_DB = `unittest-${d.getTime()}`;
        db = new Mongoose();
        db.init();
    });

    after(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should have no user in the database', async () => {
        const allusers = await User.find()
            .lean()
            .exec() as IUserModel[];
        expect(allusers).to.have.lengthOf(0);
    });

    it('should reject wrong password', async () => {
        let password: string;
        const testuser = UserBuilder.default(p => password = p);
        testuser.save();

        return request(Server)
            .post('/api/v1/login')
            .send({ username: testuser.username, password : '_' })
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
});