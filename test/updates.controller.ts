import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData } from './controller.utils';
import { EntryBuilder } from './entry.builder';
import { EntrysService } from '../server/api/services/entry.service';
import { CreateOrUpdateModel, ResponseModel } from '../server/api/models/entry';

describe('Entry', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });

    async function createEntry(rundata: RunData, entry: CreateOrUpdateModel) {
        let entryId: string;
        await request(Server)
            .post('/api/v1/bills')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(entry)
            .expect(HttpStatus.OK)
            .then(r => {
                entryId = r.body._id;
            });
        return entryId;
    }

    async function loginUserAndCreateEntry() {
        const rundata = await loginUser();
        const entry = EntryBuilder.default();
        rundata.entry = {
            date: entry.date.toISOString().substring(0, 10),
            deleted: entry.deleted,
            value: entry.value,
            remunerator: entry.remunerator,
            category: entry.category,
            info: entry.info,
        };
        rundata.entryId = await createEntry(rundata, rundata.entry);
        return rundata;
    }

    it('can return updated entries', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .get('/api/v1/updates')
            .query({ updatedMillisecondsAgo: 100000})
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.have.property('data')
                    .to.be.an('array')
                    .of.length(1);
            });
    });
    it('errors on invalid millisecond value', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .get('/api/v1/updates')
            .query({ updatedMillisecondsAgo: "thisisastring"})
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.BAD_REQUEST);
            
    });
    it('does not return old entries', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .get('/api/v1/updates')
            .query({ updatedMillisecondsAgo: 0})
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.have.property('data')
                    .to.be.an('array')
                    .of.lengthOf(0);
            });
    });
});
