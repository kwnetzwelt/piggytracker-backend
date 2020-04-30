import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData, createUser } from './controller.utils';
//import { InviteBuilder } from './invite.builder';
//import { InvitesService } from '../server/api/services/invites.service';
import { CreateOrUpdateModel, ResponseModel, Invite, IInviteModel } from '../server/api/models/invite';
import { response } from 'express';
import { User } from '../server/api/models/user';
import { HttpError } from '../server/common/errors';

describe('Invites', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });

    async function createInvite(runData:RunData) {

        let invite = new Invite();
        await request(Server)
            .get(`/api/v1/invite/`)
            .set('Authorization', 'bearer ' + runData.token)
            .send()
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                    expect(r.body).to.have.property('expires');
                    expect(r.body).to.have.property('code');
                    expect(r.body).to.have.property('fromUser');
                    expect(r.body.fromUser).to.be.a("string");
                    expect(r.body.code).to.be.a("string");
                    expect(r.body.expires).to.be.a("Date");

                invite = new Invite(r.body);
            });
        return invite;
    };
    
    async function consumeInvite(rundata: RunData,invite:IInviteModel) {
        let response = new User();
        await request(Server)
            .post(`/api/v1/invite/`)
            .set('Authorization', 'bearer ' + rundata.token)
            .send({"code" : invite.code})
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                response = new User(r.body);
            });
        
        return response;
    }

    xit("invite code is a string with 9 chars length", async () => {
        const rundata1 = await loginUser();
        const invite = await createInvite(rundata1);
        expect(invite.code).lengthOf(9);
    });

    xit("expires in the future", async () => {
        const rundata1 = await loginUser();
        const invite = await createInvite(rundata1);
        expect(invite.expires).is.greaterThan(new Date());
    });
    
    xit("cannot be consumed by issuing user", async () => {
        const rundata1 = await loginUser();
        const invite = await createInvite(rundata1);

        await request(Server)
        .post(`/api/v1/invite/`)
        .set('Authorization', 'bearer ' + rundata1.token)
        .send({"code" : invite.code})
        .expect(HttpStatus.CONFLICT)
        .then(r => {
            expect(r.body)
            .to.be.an('object');
            expect(r.body).to.have.property('message');
            expect(r.body.message).to.be.a("string");
        });
    });
    
    xit("can be consumed by other user", async () => {
        const rundata1 = await loginUser();
        const invite = await createInvite(rundata1);
        const rundata2 = await loginUser();
        const result = await consumeInvite(rundata2,invite);

        expect(result).to.have.property('group');
        expect(result.groupId).equals(rundata1.user._id);
        expect(result.groupName).equals(rundata1.user.fullname);

        // check group data is stored in user
        const rundata3 = await loginUser(rundata2);
        expect(rundata3.user.groupId).equals(rundata2.user.groupId);
        expect(rundata3.user.groupName).equals(rundata2.user.groupName);
    });
    xit("cannot be consumed twice", async () => {
        const rundata1 = await loginUser();
        const invite = await createInvite(rundata1);
        const rundata2 = await loginUser();
        const rundata3 = await loginUser();
        await consumeInvite(rundata2,invite);

        await request(Server)
            .post(`/api/v1/invite/`)
            .set('Authorization', 'bearer ' + rundata3.token)
            .send({"code" : invite.code})
            .expect(HttpStatus.NOT_FOUND);
        
    });
    
    
    

    // aus zwei wird eins
        //create user 1
        //create user 2
        //login user 2
        //create invite code user 2
        //login user 1
        //consume invite user 1
        //check database

    //tests
    //xit()
    // falscher invite code
    // richtiger invite code expected
    // invite codes können nur einmal konsumiert werden
    // gruppenzugehörigkeit
    // gruppenausstieg
    // 
});