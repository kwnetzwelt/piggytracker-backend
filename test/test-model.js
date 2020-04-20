const chai = require('chai');
const expect = chai.expect;
const model = require('../model');

describe('model', () => {
    it('can hash a password', () => {
        expect(model.hashPassword('abc')).to.equal('5b443ad2844e5b88b98c7ee8d9f1562aa10f7cd04280d33b63704f986b5eb493');
    });
});
