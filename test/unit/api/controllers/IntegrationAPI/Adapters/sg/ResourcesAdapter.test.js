'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');


describe('SG IntegrationAPI MetaController Test', () => {

  after(() => helpers.clearAllTables());

  describe("#find resources", () => {

    it('it should find list of resources', () => {
      return helpers.makeRequest('get','/sg/api/resources').then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');
      });

    });

  });
});
