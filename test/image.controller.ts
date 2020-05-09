import 'mocha';
import { expect } from 'chai';
import chai from 'chai';
chai.use(require('chai-fs'));
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';
import { TestRandom } from './test.random';
import { initDatabase, dropDatabase, loginUser, RunData, createUser } from './controller.utils';
import { CreateOrUpdateModel, ResponseModel, Invite, IInviteModel } from '../server/api/models/invite';
import { response } from 'express';
import { User, IUserModel } from '../server/api/models/user';
import { HttpError } from '../server/common/errors';
import { readFileSync, removeSync} from 'fs-extra';


describe('Images', () => {
    before(async () => {
        //await initDatabase();
    });

    after(async () => {
       // await dropDatabase();
    });

    afterEach(async () => {
        removeSync("public/uploads");
    });


    it("can receive category image", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen-gehen";
        const imageFile = readFileSync('test/test.png');
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('content-type','multipart/form-data')
            .attach('image',
            'test/test.png')
            .field("category",categoryName)
            .set('Authorization', 'bearer ' + rundata1.token)
            .then((res) => {
                expect(res.status).to.equal(200);
                const targetFileName = "public/uploads/" + rundata1.user.id + "-c-" + categoryName;
                expect(targetFileName).to.be.a.file();
                const uploadedFile = readFileSync(targetFileName);
            });
    });
    it("reject request without category image", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen-gehen";
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('content-type','multipart/form-data')
            .attach('image',
            '')
            .field("category",categoryName)
            .set('Authorization', 'bearer ' + rundata1.token)
            .then((res) => {
                expect(res.status).to.equal(400);
                const targetFileName = "public/uploads/" + rundata1.user.id + "-c-" + categoryName;
                expect(targetFileName).not.to.be.a.path();
            });
    });
    it("reject category description with whitespace", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen gehen ";
        const imageFile = readFileSync('test/test.png');
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("category",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });

    it("reject category description with uppercase", async () => {
        const rundata1 = await loginUser();
        const categoryName = "Essen-gehen";
        const imageFile = readFileSync('test/test.png');
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("category",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });
    it("reject category description with special char", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen-gehen;";
        const imageFile = readFileSync('test/test.png');
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("category",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });
    it("can remove uploaded category image", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen-gehen";
        await request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("category",categoryName)
            .attach('image',
            'test/test.png',
                'test.png')
            .expect(200);
        await request(Server)
            .delete(`/api/v1/images/category/${categoryName}`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .expect(200);
        const targetFileName = "public/uploads/" + rundata1.user.id + "-c-" + categoryName;
        expect(targetFileName).to.not.be.a.path();
    });

    /** remunerator */


    it("can receive remunerator image", async () => {
        const rundata1 = await loginUser();
        const remuneratorName = "john-doe";
        await request(Server)
            .post(`/api/v1/images/remunerator`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("remunerator",remuneratorName)
            .attach('image',
            'test/test.png',
                'test.png')
            .then((res) => {
                expect(res.status).to.equal(200);
                const targetFileName = "public/uploads/" + rundata1.user.id + "-r-" + remuneratorName;
                expect(targetFileName).to.be.a.file();
                const uploadedFile = readFileSync(targetFileName);
            });
            
    });
    it("reject request without remunerator image", async () => {
        const rundata1 = await loginUser();
        const remuneratorName = "john-doe";
        await request(Server)
            .post(`/api/v1/images/remunerator`)
            .set('content-type','multipart/form-data')
            .attach('image',
            '')
            .field("category",remuneratorName)
            .set('Authorization', 'bearer ' + rundata1.token)
            .then((res) => {
                expect(res.status).to.equal(400);
                const targetFileName = "public/uploads/" + rundata1.user.id + "-r-" + remuneratorName;
                expect(targetFileName).not.to.be.a.path();
            });
    });
    it("reject remunerator description with whitespace", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen gehen ";
        const imageFile = readFileSync('test/test.png');
        request(Server)
            .post(`/api/v1/images/remunerator`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("remunerator",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });

    it("reject remunerator description with uppercase", async () => {
        const rundata1 = await loginUser();
        const categoryName = "Essen-gehen";
        const imageFile = readFileSync('test/test.png');
        request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("remunerator",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });
    it("reject remunerator description with special char", async () => {
        const rundata1 = await loginUser();
        const categoryName = "essen-gehen;";
        const imageFile = readFileSync('test/test.png');
        request(Server)
            .post(`/api/v1/images/category`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("remunerator",categoryName)
            .attach('image',
                imageFile,
                'test.png')
            .expect(400);
            
    });

    it("can remove uploaded remunerator image", async () => {
        const rundata1 = await loginUser();
        const remuneratorName = "john-doe";
        await request(Server)
            .post(`/api/v1/images/remunerator`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .set('content-type','multipart/form-data')
            .field("remunerator",remuneratorName)
            .attach('image',
                'test/test.png',
                'test.png')
            .expect(200);
        await request(Server)
            .delete(`/api/v1/images/remunerator/${remuneratorName}`)
            .set('Authorization', 'bearer ' + rundata1.token)
            .expect(HttpStatus.OK);
        const targetFileName = "public/uploads/" + rundata1.user.id + "-c-" + remuneratorName;
        expect(targetFileName).to.not.be.a.path();
        
    });
});