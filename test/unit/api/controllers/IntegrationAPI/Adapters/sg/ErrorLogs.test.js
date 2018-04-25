'use strict';

const Promise = require('bluebird'),
  should = require('chai').should(),
  helpers = require(__basedir + '/helpers');

describe('SG IntegrationAPI error logs test', () => {

  after(() => helpers.clearAllTables());

  describe("#add error logs", () => {

    const userId = 'NecadiOwg9-firmOolt8';

    it('it should create error', () => {

      return helpers.makeRequest('post','/sg/api/resources/objects/user', {id: userId}).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');

        return Promise.delay(5000);
      }).then(() => {
        return ApiErrorLog.findOne({where: {objectId: ['sg',userId].join('_')}});
      }).then(errorEntry => {
        should.exist(errorEntry);
        errorEntry.should.have.property('adapter', 'sg');
        errorEntry.should.have.property('state', 'error');
        errorEntry.should.have.property('method', 'create');
        errorEntry.should.have.property('resourceName', 'user');
      });

    });

    it('it should not find resource', () => {
      return helpers.makeRequest('post', '/sg/api/resources/objects/user', {
        id: userId,
        firstName: userId,
        lastName: userId,
        phone: "380111111113"
      }).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return Promise.delay(5000);
      }).then(() => {
        return ApiErrorLog.findOne({where: {objectId: ['sg',userId].join('_')}});
      }).then(errorEntry => {
        should.exist(errorEntry);
        errorEntry.should.have.property('state', 'fixed');
      });
    });

  });
});
