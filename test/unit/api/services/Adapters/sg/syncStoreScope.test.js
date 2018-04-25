'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  STORE_ID_1 = '1',
  STORE_ID_2 = '2';

let syncAdapter,
  IntegrationAPIScopes;

describe('SG syncStoreScope service test', () => {
  before(() => helpers.createStores(true).then(() => {
    syncAdapter = new SGAdapterService.SyncStoreScope();
    IntegrationAPIScopes = sails.config.scopesMatchList.map(({name}) => name);
  }));

  after(() => helpers.clearAllTables());

  it('should sync store scope (first time)', () => {
    return Store.findOne({where: {id: STORE_ID_1}}).then(store => {
      should.exist(store);
      should.exist(store.scope);
      store.scope.should.be.an('array');
      store.scope.should.be.an.empty;

      return syncAdapter.sync(STORE_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Store.findOne({where: {id: STORE_ID_1}});
    }).then(store => {
      should.exist(store);
      should.exist(store.scope);
      store.scope.should.be.an('array');
      store.scope.should.be.eql(IntegrationAPIScopes);
    });
  });

  it('should sync store scope (second time) after caching', () => {
    return Store.findOne({where: {id: STORE_ID_2}}).then(store => {
      should.exist(store);
      should.exist(store.scope);
      store.scope.should.be.an('array');
      store.scope.should.be.an.empty;

      return syncAdapter.sync(STORE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Store.findOne({where: {id: STORE_ID_2}});
    }).then(store => {
      should.exist(store);
      should.exist(store.scope);
      store.scope.should.be.an('array');
      store.scope.should.be.eql(IntegrationAPIScopes);
    });
  });

  it('should sync store scope after manufacturerId update', () => {
    return Store.update({manufacturerId: '1'}, {where: {id: STORE_ID_2}}).then(() => {
      return syncAdapter.sync(STORE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Store.findOne({where: {id: STORE_ID_2}});
    }).then(store => {
      should.exist(store);
      should.exist(store.scope);
      store.scope.should.be.an('array');
      store.scope.should.be.eql(IntegrationAPIScopes);
    });
  });
});
