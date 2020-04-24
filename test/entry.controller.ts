import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser } from './controller.utils';
import { EntryBuilder } from './entry.builder';
import { EntrysService } from '../server/api/services/entry.service';

describe('Entry', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });


    it('cannot be added when not authenticated', () => {
        return request(Server)
            .post('/api/v1/bill')
            .send({
                date: new Date().toISOString().substring(0, 10),
                value: 17,
                renumerator: TestRandom.randomString(9, 're-'),
                category: TestRandom.randomString(8),
                info: TestRandom.randomString(24)
            })
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('can be added with empty body when authenticated', async () => {
        const rundata = await loginUser();

        return request(Server)
            .post('/api/v1/bill')
            .set('Authorization', 'bearer ' + rundata.token)
            .send({})
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                expect(r.body).to.have.property('date');
                expect(r.body).to.have.property('value');
                expect(r.body).to.have.property('category');
                expect(r.body).to.have.property('info');
            });
    });

    it('can be added with all fields when authenticated', async () => {
        const rundata = await loginUser();
        const entry = {
            date: new Date().toISOString().substring(0, 10),
            value: 17,
            remunerator: TestRandom.randomString(9, 're-'),
            category: TestRandom.randomString(8),
            info: TestRandom.randomString(24)
        };

        return request(Server)
            .post('/api/v1/bill')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(entry)
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                expect(r.body).to.have.property('date');
                expect(r.body).to.have.property('value');
                expect(r.body).to.have.property('remunerator');
                expect(r.body).to.have.property('category');
                expect(r.body).to.have.property('info');
                expect(r.body.date.substring(0, 10)).to.equal(entry.date);
                expect(r.body.value).to.equal(entry.value);
                expect(r.body.remunerator).to.equal(entry.remunerator);
                expect(r.body.category).to.equal(entry.category);
                expect(r.body.info).to.equal(entry.info);
                expect(r.body).to.not.have.property('fromUser');
            });
    });

    it('can be retrieved by id', async () => {
        const rundata = await loginUser();
        const entry = EntryBuilder.default();
        entry.save();

        return request(Server)
            .get(`/api/v1/bill/${entry._id}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                expect(r.body).to.have.property('_id').to.equal(String(entry._id));
                expect(r.body).to.have.property('date').to.equal(entry.date.toISOString().substring(0, 10));
                expect(r.body).to.have.property('value').to.equal(entry.value);
                expect(r.body).to.have.property('remunerator').to.equal(entry.remunerator);
                expect(r.body).to.have.property('category').to.equal(entry.category);
                expect(r.body).to.have.property('info').to.equal(entry.info);
                expect(r.body).to.not.have.property('fromUser');
            });
    });

    it('can be stored and retrieved', async () => {
        const rundata = await loginUser();
        const entry = {
            date: new Date().toISOString().substring(0, 10),
            value: 17,
            remunerator: TestRandom.randomString(9, 're-'),
            category: TestRandom.randomString(8),
            info: TestRandom.randomString(24)
        };

        let entryId: string;
        await request(Server)
            .post('/api/v1/bill')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(entry)
            .expect(HttpStatus.OK)
            .then(r => {
                entryId = r.body._id;
            });

        let entryFromServer: {};
        return request(Server)
            .get(`/api/v1/bill/${entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                entryFromServer = r.body;
                expect(r.body).to.have.property('_id').to.equal(entryId);
                expect(r.body).to.have.property('date').to.equal(entry.date);
                expect(r.body).to.have.property('value').to.equal(entry.value);
                expect(r.body).to.have.property('remunerator').to.equal(entry.remunerator);
                expect(r.body).to.have.property('category').to.equal(entry.category);
                expect(r.body).to.have.property('info').to.equal(entry.info);
                expect(r.body).to.not.have.property('fromUser');
            });
    });

    it('has userid as group id in database', async () => {
        const rundata = await loginUser();

        let entryId: string;
        await request(Server)
            .post('/api/v1/bill')
            .set('Authorization', 'bearer ' + rundata.token)
            .send({})
            .expect(HttpStatus.OK)
            .then(r => {
                entryId = r.body._id;
            });

        const doc = await (new EntrysService().byId(entryId));

        expect(doc.fromUser).to.equal(String(rundata.user._id));
    });
    xit('cannot be retrieved by id when user is not in group', () => {
        // TODO
    });


});
