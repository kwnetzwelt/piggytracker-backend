import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData } from './controller.utils';
import { TargetsBuilder } from './targets.builder';
import TargetsService from '../server/api/services/targets.service';
import { Target } from '../server/api/models/target';

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
        const doc = await Target.findOne({ _id }).lean().exec();

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

    it('can be added with same tid-value for different users', async () => {
        const rundata = await loginUser();
        const target = TargetsBuilder.forTid(230).numberOfTotals(2).build();

        const firstId = await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK);

        const otherlogin = await loginUser();
        const secondId = await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + otherlogin.token)
            .send(target)
            .expect(HttpStatus.OK);

        expect(firstId).to.not.be.eql(secondId);
    });

    it('cannot be loaded from server without authentication', async () => {
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

        await request(Server)
            .get(`/api/v1/targets/${_id}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('can be loaded from server', async () => {
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

        const doc = await request(Server)
            .get(`/api/v1/targets/${_id}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .then(r => r.body);

        expect(doc._id).to.equal(_id);
        expect(doc.totals).to.be.an('array').of.lengthOf(2);
        expect(doc.tid).to.equal(230);
    });

    it('cannot be loaded from server as other user', async () => {
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

        const otherlogin = await loginUser();
        await request(Server)
            .get(`/api/v1/targets/${_id}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .expect(HttpStatus.NOT_FOUND);
    });
});
