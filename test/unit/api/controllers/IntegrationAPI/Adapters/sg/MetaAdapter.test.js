'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');

describe('SG IntegrationAPI MetaController Test', () => {

  after(() => helpers.clearAllTables());

  describe("#findOne", () => {

    it('it should find resource in different registers', () => {
      return helpers.makeRequest('get','/sg/api/resources/meta/user').then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');
      });

    });

    it('it should not find resource', () => {
      return helpers.makeRequest('get', '/sg/api/resources/meta/unknownresource').then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');
      });
    });

  });
});
