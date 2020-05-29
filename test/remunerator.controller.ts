import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { initDatabase, dropDatabase, loginUser} from './controller.utils';

describe('Remunerator', () => {
    before(async () => {
        await initDatabase();
    });

    after(async () => {
        await dropDatabase();
    });

    it("store/receive offset for remunerator", async () => {
        const rundata1 = await loginUser();
        await request(Server)
        .post('/api/v1/remunerator')
        .set('Authorization', 'bearer ' + rundata1.token)
        .send({remunerator : {name: "Klaus Kinski", offset : 1}})
        //.expect(HttpStatus.OK)
        .then(r => {
            console.log(JSON.stringify(r));
        });

        await request(Server)
        .get('/api/v1/remunerator')
        .set('Authorization', 'bearer ' + rundata1.token)
        .send()
        //.expect(HttpStatus.OK)
        .then(r2 => {

            expect(r2.body).to.be.an('object');
            expect(r2.body).to.have.property('data');
            expect(r2.body.data).to.be.an('array');
            expect(r2.body.data[0]).to.have.property("name");
            expect(r2.body.data[0]).to.have.property("offset");
            expect(r2.body.data[0].name).to.equal("Klaus Kinski");
            expect(r2.body.data[0].offset).to.equal(1);
        })    ;
    
    });

    it("prevent duplicates for remunerators with same name", async () => {
        const rundata1 = await loginUser();
        await request(Server)
        .post('/api/v1/remunerator')
        .set('Authorization', 'bearer ' + rundata1.token)
        .send({remunerator : {name: "Klaus Kinski", offset : 1}})
        //.expect(HttpStatus.OK)
        .then(r => {
            console.log(JSON.stringify(r));
        });

        await request(Server)
        .post('/api/v1/remunerator')
        .set('Authorization', 'bearer ' + rundata1.token)
        .send({remunerator : {name: "Klaus Kinski", offset : 2}})
        //.expect(HttpStatus.OK)
        .then(r => {
            console.log(JSON.stringify(r));
        });

        await request(Server)
        .get('/api/v1/remunerator')
        .set('Authorization', 'bearer ' + rundata1.token)
        .send()
        //.expect(HttpStatus.OK)
        .then(r2 => {

            expect(r2.body).to.be.an('object');
            expect(r2.body).to.have.property('data');
            expect(r2.body.data).to.be.an('array');
            expect(r2.body.data.length).to.equal(1);
            expect(r2.body.data[0]).to.have.property("name");
            expect(r2.body.data[0]).to.have.property("offset");
            expect(r2.body.data[0].name).to.equal("Klaus Kinski");
            expect(r2.body.data[0].offset).to.equal(2);
        })    ;
    
    });

});