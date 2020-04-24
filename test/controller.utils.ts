import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { UserBuilder } from './user.builder';
import { IUserModel } from '../server/api/models/user';
import Mongoose from '../server/common/mongoose';

export interface RunData {
    user: IUserModel,
    password: string,
    token?: string,
    entryId?: string,
    entry?: {
        date: string,
        value: number,
        remunerator: string,
        category: string,
        info: string,
    }
}

export async function initDatabase() {
    const d = new Date();
    process.env.MONGO_DB = `unittest-${d.getTime()}`;
    const db = new Mongoose();
    db.init();
    return db;
}

export async function dropDatabase() {
    await mongoose.connection.db.dropDatabase();
}

export async function createUser(): Promise<RunData> {
    let password: string;
    const testuser = UserBuilder.default(p => password = p);
    await testuser.save();
    return {
        user: testuser,
        password: password
    };
}

export async function loginUser(rundata?: RunData) {
    if (!rundata) {
        rundata = await createUser();
    }
    await request(Server)
        .post('/api/v1/login')
        .send({ username: rundata.user.username, password: rundata.password })
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)
        .then(r => {
            expect(r.body)
                .to.be.an('object')
                .that.has.property('token');
            rundata.token = r.body.token;
        });
    return rundata;
}
