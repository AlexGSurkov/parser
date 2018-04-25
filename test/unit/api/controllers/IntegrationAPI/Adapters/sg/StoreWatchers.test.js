'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers'),
  KeyModifier = require(__basedir + '/../api/services/KeyModifier'),
  keyModifier = new KeyModifier('sg'),
  store = {
    "id": "1",
    "SWCode": "aaa1",
    "legalName": "legal name01",
    "actualName": "Actual name01",
    "actualAddress": "addr 01",
    "legalAddress": "legal addr",
    "city": "city",
    "delay": 3,
    "latitude": 1123.43,
    "longitude": 2323.34
  };

describe('SG store watchers Test', () => {

  after(() => helpers.clearAllTables());

  describe("#Scope to store", () => {

    after(() => Store.destroy({where: {}}));

    it('should create store with all scopes', () => {
      const IntegrationAPIScopes = sails.config.scopesMatchList.map(({name}) => name);

      return helpers.makeRequest('post', '/sg/api/resources/objects/store', store).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return Store.findOne({where: {id: keyModifier.encode(store.id)}});
      }).then(createdStore => {
        createdStore.should.have.property('scope');
        createdStore.scope.should.deep.equal(IntegrationAPIScopes);
      });
    });

    it('should set all scopes to store after store update', () => {
      const IntegrationAPIScopes = sails.config.scopesMatchList.map(({name}) => name);

      return helpers.makeRequest('put', `/sg/api/resources/objects/store/${store.id}`, {scope: []}).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return Store.findOne({where: {id: keyModifier.encode(store.id)}});
      }).then(updatedStore => {
        updatedStore.should.have.property('scope');
        updatedStore.scope.should.deep.equal(IntegrationAPIScopes);
      });
    });

  });

});
