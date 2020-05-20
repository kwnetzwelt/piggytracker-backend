import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';
import * as HttpStatus from 'http-status-codes';

describe('Health', () => {
    
    it('should report health status UP', async () => {
        return request(Server)
            .get('/health')
            .send()
            .expect(HttpStatus.OK)
            .then(r => {
                expect(r.body)
                    .to.be.an('object')
                    .to.have.property('status').equals('UP');
            });
    });

});