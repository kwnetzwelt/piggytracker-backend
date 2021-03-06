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
import { writeFileSync, removeSync, unlinkSync } from 'fs-extra';

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

    it('cannot be added when not authenticated', () => {
        return request(Server)
            .post('/api/v1/bills')
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
            .post('/api/v1/bills')
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
                const category = r.body.category;
                expect(category).to.equal("");
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
            .post('/api/v1/bills')
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
                expect(r.body).to.not.have.property('dummy');
            });
    });

    it('can be retrieved by id', async () => {
        const rundata = await loginUser();
        const entry = EntryBuilder.with().user(rundata).build();
        await entry.save();

        return request(Server)
            .get(`/api/v1/bills/${entry._id}`)
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
            .post('/api/v1/bills')
            .set('Authorization', 'bearer ' + rundata.token)
            .send(entry)
            .expect(HttpStatus.OK)
            .then(r => {
                entryId = r.body._id;
            });

        return request(Server)
            .get(`/api/v1/bills/${entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
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
            .post('/api/v1/bills')
            .set('Authorization', 'bearer ' + rundata.token)
            .send({})
            .expect(HttpStatus.OK)
            .then(r => {
                entryId = r.body._id;
            });

        const doc = await (new EntrysService().byId(entryId, String(rundata.user._id)));

        expect(doc.fromUser).to.equal(String(rundata.user._id));
    });

    it('cannot be retrieved by id when user is not in group', async () => {
        const firstuser = await loginUserAndCreateEntry();

        const otherlogin = await loginUser();
        return request(Server)
            .get(`/api/v1/bills/${firstuser.entryId}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('cannot be retrieved without authorization', async () => {
        const firstuser = await loginUserAndCreateEntry();

        const otherlogin = await loginUser();
        return request(Server)
            .get(`/api/v1/bills/${firstuser.entryId}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('cannot be updated without authorization', async () => {
        const rundata = await loginUserAndCreateEntry();

        return request(Server)
            .put(`/api/v1/bills/${rundata.entryId}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('can be updated and reponse has new field values', async () => {
        const rundata = await loginUserAndCreateEntry();
        const entry = {
            date: new Date().toISOString().substring(0, 10),
            value: 17,
            remunerator: TestRandom.randomString(9, 're-'),
            category: TestRandom.randomString(8),
            info: TestRandom.randomString(24)
        };
        await request(Server)
            .put(`/api/v1/bills/${rundata.entryId}`)
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
                expect(r.body).to.not.have.property('dummy');
            });
    });

    it('can be updated and getting entry again shows new field values', async () => {
        const rundata = await loginUserAndCreateEntry();
        const entry = {
            date: new Date().toISOString().substring(0, 10),
            value: 17,
            remunerator: TestRandom.randomString(9, 're-'),
            category: TestRandom.randomString(8),
            info: TestRandom.randomString(24)
        };
        await request(Server)
            .put(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .send(entry)
            .expect(HttpStatus.OK);

        return request(Server)
            .get(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body).to.have.property('_id').to.equal(rundata.entryId);
                expect(r.body).to.have.property('date').to.equal(entry.date);
                expect(r.body).to.have.property('value').to.equal(entry.value);
                expect(r.body).to.have.property('remunerator').to.equal(entry.remunerator);
                expect(r.body).to.have.property('category').to.equal(entry.category);
                expect(r.body).to.have.property('info').to.equal(entry.info);
                expect(r.body).to.not.have.property('fromUser');
            });
    });

    it('cannot be updated by other user', async () => {
        const rundata = await loginUserAndCreateEntry();
        const otherlogin = await loginUser();
        await request(Server)
            .put(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .send()
            .expect(HttpStatus.NOT_FOUND);
    });

    it('can be deleted', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .delete(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK);
    });

    it('can be deleted and response contains its values', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .delete(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .then(r => {
                expect(r.body).to.have.property('_id').to.equal(rundata.entryId);
                expect(r.body).to.have.property('date').to.equal(rundata.entry.date);
                expect(r.body).to.have.property('value').to.equal(rundata.entry.value);
                expect(r.body).to.have.property('remunerator').to.equal(rundata.entry.remunerator);
                expect(r.body).to.have.property('category').to.equal(rundata.entry.category);
                expect(r.body).to.have.property('info').to.equal(rundata.entry.info);
                expect(r.body).to.not.have.property('fromUser');
                expect(r.body).to.not.have.property('dummy');
            });
    });

    it('cannot be retrieved after it has been deleted', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .delete(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK);
        return request(Server)
            .get(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('cannot be deleted without authorization', async () => {
        const rundata = await loginUserAndCreateEntry();
        await request(Server)
            .delete(`/api/v1/bills/${rundata.entryId}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('cannot be deleted by other user', async () => {
        const rundata = await loginUserAndCreateEntry();
        const otherlogin = await loginUser();

        await request(Server)
            .delete(`/api/v1/bills/${rundata.entryId}`)
            .set('Authorization', 'bearer ' + otherlogin.token)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('list can be retrieved', async () => {
        const rundata = await loginUserAndCreateEntry();
        await createEntry(rundata, EntryBuilder.with().asRestModel());
        await createEntry(rundata, EntryBuilder.with().asRestModel());
        await createEntry(rundata, EntryBuilder.with().asRestModel());

        await request(Server)
            .get('/api/v1/bills')
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
        await loginUserAndCreateEntry();

        await request(Server)
            .get('/api/v1/bills')
            .query({
                perPage: 100,
                page: 1,
            })
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('list cannot be retrieved by other user', async () => {
        const rundata = await loginUserAndCreateEntry();
        createEntry(rundata, EntryBuilder.with().asRestModel());
        createEntry(rundata, EntryBuilder.with().asRestModel());
        createEntry(rundata, EntryBuilder.with().asRestModel());

        const otherlogin = await loginUser();

        await request(Server)
            .get('/api/v1/bills')
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
        const rundata = await loginUserAndCreateEntry();
        const listofid: string[] = [rundata.entryId];
        for (let i = 0; i < 7; i++) {
            listofid.push(await createEntry(rundata, EntryBuilder.with().asRestModel()));
        }

        const responseIdList: string[] = []

        for (let i = 1; i < 5; i++) {
            await request(Server)
                .get('/api/v1/bills')
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
        const rundata = await loginUserAndCreateEntry();

        await request(Server)
            .get('/api/v1/bills')
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

    it('can export all entries', async () => {
        const rundata = await loginUserAndCreateEntry();
        const csvString = "date,deleted,value,category,remunerator,info\n" 
            + new Date(rundata.entry.date).toISOString()
            + ","
            + rundata.entry.deleted
            + ","
            + rundata.entry.value
            + ","
            + rundata.entry.category
            + ","
            + rundata.entry.remunerator
            + ","
            + rundata.entry.info;
        
        await request(Server)
            .get('/api/v1/bills/export')
            .set('Authorization', 'bearer ' + rundata.token)
            .expect(HttpStatus.OK)
            .then(r => {
                console.log(r.text);
                expect(r).to.have.property("text");
                expect(r.text).to.equal(csvString);
            });
    });

    it('can import new entries from csv', async () => {
        const rundata = await loginUserAndCreateEntry();
        const entry = EntryBuilder.default();
        const csvString = "date,value,category,remunerator,info\n" 
            + new Date(entry.date).toISOString()
            + ","
            + entry.value
            + ","
            + entry.category
            + ","
            + entry.remunerator
            + ","
            + entry.info;
        writeFileSync("test.csv", csvString);
        await request(Server)
            .post(`/api/v1/bills/import`)
            .set('content-type','multipart/form-data')
            .attach('csv',
                "test.csv")
            .field("clear","false")
            .set('Authorization', 'bearer ' + rundata.token)
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("count");
                expect(res.body.count).to.equal(1);

                
            }).finally(() => {

                unlinkSync("test.csv");
            });
        // we would expect to now have 2 entries in the database
        await request(Server)
        .get('/api/v1/bills')
        .query({
            perPage: 300,
            page: 1,
        })
        .set('Authorization', 'bearer ' + rundata.token)
        .then((r) => {
            expect(r.body).to.have.property("data");
            expect(r.body.data).to.be.an("array").of.length(2);
        });
    });

    it('can import new entries from csv and clear existing', async () => {
        const rundata = await loginUserAndCreateEntry();
        const entry = EntryBuilder.default();
        const csvString = "date,value,category,remunerator,info\n" 
            + new Date(entry.date).toISOString()
            + ","
            + entry.value
            + ","
            + entry.category
            + ","
            + entry.remunerator
            + ","
            + entry.info;
        writeFileSync("test.csv", csvString);
        await request(Server)
            .post(`/api/v1/bills/import`)
            .set('content-type','multipart/form-data')
            .attach('csv',
                "test.csv")
            .field("clear","true")
            .set('Authorization', 'bearer ' + rundata.token)
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("count");
                expect(res.body.count).to.equal(1);

                
            }).finally(() => {

                unlinkSync("test.csv");
            });
        // we would expect to now have 1 entries in the database
        await request(Server)
        .get('/api/v1/bills')
        .query({
            perPage: 300,
            page: 1,
        })
        .set('Authorization', 'bearer ' + rundata.token)
        .then((r) => {
            expect(r.body).to.have.property("data");
            expect(r.body.data).to.be.an("array").of.length(1);
        });
    });

    it('can import new entries from csv and clear existing and not touch others', async () => {
        const rundata = await loginUserAndCreateEntry();
        const rundata2 = await loginUserAndCreateEntry();
        const entry = EntryBuilder.default();
        const csvString = "date,value,category,remunerator,info\n" 
            + new Date(entry.date).toISOString()
            + ","
            + entry.value
            + ","
            + entry.category
            + ","
            + entry.remunerator
            + ","
            + entry.info;
        writeFileSync("test.csv", csvString);
        await request(Server)
            .post(`/api/v1/bills/import`)
            .set('content-type','multipart/form-data')
            .attach('csv',
                "test.csv")
            .field("clear","true")
            .set('Authorization', 'bearer ' + rundata.token)
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("count");
                expect(res.body.count).to.equal(1);

                
            }).finally(() => {

                unlinkSync("test.csv");
            });
        // we would expect to now have 1 entry in the database
        await request(Server)
        .get('/api/v1/bills')
        .query({
            perPage: 300,
            page: 1,
        })
        .set('Authorization', 'bearer ' + rundata.token)
        .then((r) => {
            expect(r.body).to.have.property("data");
            expect(r.body.data).to.be.an("array").of.length(1);
        });

        // we would expect to now have 1 entry in the database
        await request(Server)
        .get('/api/v1/bills')
        .query({
            perPage: 300,
            page: 1,
        })
        .set('Authorization', 'bearer ' + rundata2.token)
        .then((r) => {
            expect(r.body).to.have.property("data");
            expect(r.body.data).to.be.an("array").of.length(1);
        });
    });
});
