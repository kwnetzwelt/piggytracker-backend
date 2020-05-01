import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { UserBuilder } from './user.builder';
import { IUserModel, User } from '../server/api/models/user';
import Mongoose from '../server/common/mongoose';
import { CreateOrUpdateModel as EntryCreateOrUpdateModel, Entry } from '../server/api/models/entry';
import { Target, CreateOrUpdateModel as TargetCreateOrUpdateModel } from '../server/api/models/target';

export interface RunData {
    user: IUserModel,
    password: string,
    token?: string,
    entryId?: string,
    entry?: EntryCreateOrUpdateModel,
    targetId?: string,
    target?: TargetCreateOrUpdateModel,
    groupId?:string,
    groupName?:string
}

export async function initDatabase() {
    process.env.MONGO_DB = `unittest`;
    const db = new Mongoose();
    db.init();
    await Entry.collection.deleteMany({});
    await User.collection.deleteMany({});
    await Target.collection.deleteMany({});

    return db;
}

export async function dropDatabase() {
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
            rundata.user.groupId = r.body.userProfile.groupId;
            rundata.user.groupName = r.body.userProfile.groupName;
        });
    return rundata;
}
