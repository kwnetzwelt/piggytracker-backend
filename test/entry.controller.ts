import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser } from './controller.utils';

describe('Entry', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });


    it('Cannot add entry when not authenticated', () => {
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

    it('Can add empty entry when authenticated', async () => {
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

    it('Can add full entry when authenticated', async () => {
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
            });
    });
});
