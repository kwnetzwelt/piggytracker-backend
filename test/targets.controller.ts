import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData } from './controller.utils';
import { TargetsBuilder } from './targets.builder';
import TargetsService from '../server/api/services/targets.service';
import { Target, CreateOrUpdateModel, ResponseModel } from '../server/api/models/target';

describe('Target', () => {
    beforeEach(async () => {
        await initDatabase();
    });

    afterEach(async () => {
        await dropDatabase();
    });

    async function createTarget(rundata: RunData, target: CreateOrUpdateModel) {
        return await request(Server)
            .post('/api/v1/targets')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK)
            .then(r => r.body._id);
    }

    async function loginUserAndCreateTarget(tid: number) {
        const rundata = await loginUser();
        const target = TargetsBuilder.forTid(tid).numberOfTotals(2).build();
        rundata.target = {
            totals: target.totals,
            tid: target.tid,
        };
        rundata.targetId = await createTarget(rundata, rundata.target);
        return rundata;
    }

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

    it('can be updated', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const target = TargetsBuilder.forTid(240).numberOfTotals(3).build();

        await request(Server)
            .put(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .send(target)
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                expect(r.body).to.have.property('totals').to.be.an('array').of.lengthOf(target.totals.length);
                expect(r.body).to.have.property('tid');
                expect(r.body.tid).to.equal(target.tid);
                expect(r.body._id).to.equal(rundata.targetId);
            });
    });

    it('can update tid', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const newTid = 240;

        await request(Server)
            .put(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .send({ tid: newTid })
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('_id');
                expect(r.body).to.have.property('totals').to.be.an('array').of.lengthOf(rundata.target.totals.length);
                expect(r.body).to.have.property('tid');
                expect(r.body.tid).to.equal(newTid);
                expect(r.body._id).to.equal(rundata.targetId);
            });
    });

    it('cannot be updated without authorization', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const target = TargetsBuilder.forTid(240).numberOfTotals(3).build();

        await request(Server)
            .put(`/api/v1/targets/${rundata.targetId}`)
            .send(target)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('cannot be updated by other user', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const otherlogin = await loginUser();
        const target = TargetsBuilder.forTid(240).numberOfTotals(3).build();

        await request(Server)
            .put(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .send(target)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('cannot be updated with duplicate tid', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const tid240_id = await createTarget(rundata, TargetsBuilder.forTid(240).build());
        await request(Server)
            .put(`/api/v1/targets/${tid240_id}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .send({
                tid: rundata.target.tid
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('can be deleted', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await request(Server)
            .delete(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK);
    });

    it('can be deleted and response contains its values', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await request(Server)
            .delete(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body).to.have.property('_id').to.equal(rundata.targetId);
                expect(r.body).to.have.property('tid').to.equal(rundata.target.tid);
                expect(r.body).to.have.property('totals').to.be.an('array').of.length(rundata.target.totals.length);
            });
    });

    it('cannot be retrieved after it has been deleted', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await request(Server)
            .delete(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK);
        return request(Server)
            .get(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('cannot be deleted without authorization', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await request(Server)
            .delete(`/api/v1/targets/${rundata.targetId}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('cannot be deleted by other user', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const otherlogin = await loginUser();

        await request(Server)
            .delete(`/api/v1/targets/${rundata.targetId}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('list can be retrieved', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await createTarget(rundata, TargetsBuilder.forTid(231).numberOfTotals(2).build());
        await createTarget(rundata, TargetsBuilder.forTid(232).numberOfTotals(2).build());
        await createTarget(rundata, TargetsBuilder.forTid(233).numberOfTotals(2).build());

        await request(Server)
            .get('/api/v1/targets')
            .query({
                perPage: 100,
                page: 1,
            })
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.be.an('object');
                expect(r.body).to.have.property('data');
                expect(r.body).to.have.property('page');
                expect(r.body).to.have.property('total');
                expect(r.body.data)
                    .to.be.an('array')
                    .of.lengthOf(4);
            });
    });

    it('list cannot be accessed without authorization', async () => {
        await loginUserAndCreateTarget(230);

        await request(Server)
            .get('/api/v1/targets')
            .query({
                perPage: 100,
                page: 1,
            })
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('list cannot be retrieved by other user', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        await createTarget(rundata, TargetsBuilder.forTid(231).numberOfTotals(2).build());
        await createTarget(rundata, TargetsBuilder.forTid(232).numberOfTotals(2).build());
        await createTarget(rundata, TargetsBuilder.forTid(233).numberOfTotals(2).build());

        const otherlogin = await loginUser();

        await request(Server)
            .get('/api/v1/targets')
            .query({
                perPage: 100,
                page: 1,
            })
            .set('Authorization', 'bearer ' + otherlogin.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body)
                    .to.have.property('data')
                    .to.be.an('array')
                    .of.lengthOf(0);
            });
    });

    it('list page can be retrieved', async () => {
        const rundata = await loginUserAndCreateTarget(230);
        const listofid: string[] = [rundata.targetId];
        for (let i = 0; i < 7; i++) {
            listofid.push(await createTarget(rundata, TargetsBuilder.forTid(231 + i).numberOfTotals(2).build()));
        }

        const responseIdList: string[] = []

        for (let i = 1; i < 5; i++) {
            await request(Server)
                .get('/api/v1/targets')
                .query({
                    perPage: 3,
                    page: i,
                })
                .set('Authorization', 'bearer ' + rundata.token)
                .expect(HttpStatus.OK)
                .expect('Content-Type', /json/)
                .then(r => {
                    expect(r.body)
                        .to.have.property('data')
                        .to.be.an('array');
                    expect(r.body)
                        .to.have.property('page').to.equal(i);
                    expect(r.body)
                        .to.have.property('total').to.equal(listofid.length);
                    r.body.data.forEach((b: ResponseModel) => responseIdList.push(b._id));
                });
        }

        expect(responseIdList).to.eql(listofid);
    });

    it('list page can be retrieved even if it is empty', async () => {
        const rundata = await loginUserAndCreateTarget(230);

        await request(Server)
            .get('/api/v1/targets')
            .query({
                perPage: 3,
                page: 10,
            })
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
