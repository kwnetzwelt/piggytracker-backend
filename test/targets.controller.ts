import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData } from './controller.utils';
import { TargetsBuilder } from './targets.builder';
import TargetsService from '../server/api/services/targets.service';

describe('Target', () => {
    beforeEach(async () => {
        await initDatabase();
    });

    afterEach(async () => {
        await dropDatabase();
    });

    it('cannot be added when not authenticated', () => {
        return request(Server)
            .post('/api/v1/targets')
            .send({
                "totals": [
                    {
                        "category": "car",
                        "value": 10
                    }
                ],
                "tid": 123
            })
            .expect(HttpStatus.UNAUTHORIZED)
    });

    it('can be added when authenticated', async () => {
        const rundata = await loginUser();
        const target = TargetsBuilder.forTid(230).numberOfTotals(2).build();

        return request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                expect(r.body).to.have.property('totals').to.be.an('array').of.lengthOf(2);
                expect(r.body).to.have.property('tid');
                expect(r.body.totals.map(
                    (t: any) => { return { category: t.category, value: t.value }; })
                ).to.eql(target.totals);
                expect(r.body.tid).to.eql(target.tid);
                expect(r.body).to.not.have.property('fromUser');

                const firstTotal = r.body.totals[0];
                expect(firstTotal).to.be.an('object');
                expect(firstTotal).to.have.property('category');
                expect(firstTotal).to.have.property('value');
                expect(firstTotal).to.not.have.property('_id');
            });
    });

    it('has fromUser set when written to database', async () => {
        const rundata = await loginUser();
        const target = TargetsBuilder.forTid(230).numberOfTotals(2).build();

        const _id = await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                return r.body._id;
            });
        const doc = await TargetsService.byId(_id);

        expect(doc.fromUser).to.equal(String(rundata.user._id));
        expect(doc.fromUser).to.not.be.undefined;
        expect(doc.fromUser).to.not.eql("");
        expect(doc.fromUser).to.not.eql(null);
    });

    it('cannot be added twice for same tid-value', async () => {
        const rundata = await loginUser();
        const target = TargetsBuilder.forTid(230).numberOfTotals(2).build();

        await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK);

        await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.BAD_REQUEST);
    });
});
