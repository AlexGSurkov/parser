'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  STORETYPE_ID_1 = '1',
  STORETYPE_ID_2 = '2',
  STORETYPE_SCOPE_1 = ['JDE'],
  STORETYPE_SCOPE_2 = ['MNDLZ'];

let syncAdapter;

describe('SG syncStoreTypeScope service test', () => {
  before(() => helpers.createStoreTypes(true).then(() => {
    syncAdapter = new SGAdapterService.SyncStoreTypeScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync storeType scope (first time)', () => {
    return StoreType.findOne({where: {id: STORETYPE_ID_1}}).then(storeType => {
      should.exist(storeType);
      should.exist(storeType.scope);
      storeType.scope.should.be.an('array');
      storeType.scope.should.be.an.empty;

      return syncAdapter.sync(STORETYPE_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreType.findOne({where: {id: STORETYPE_ID_1}});
    }).then(storeType => {
      should.exist(storeType);
      should.exist(storeType.scope);
      storeType.scope.should.be.an('array');
      storeType.scope.should.be.eql(STORETYPE_SCOPE_1);
    });
  });

  it('should sync storeType scope (second time) after caching', () => {
    return StoreType.findOne({where: {id: STORETYPE_ID_2}}).then(storeType => {
      should.exist(storeType);
      should.exist(storeType.scope);
      storeType.scope.should.be.an('array');
      storeType.scope.should.be.an.empty;

      return syncAdapter.sync(STORETYPE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreType.findOne({where: {id: STORETYPE_ID_2}});
    }).then(storeType => {
      should.exist(storeType);
      should.exist(storeType.scope);
      storeType.scope.should.be.an('array');
      storeType.scope.should.be.eql(STORETYPE_SCOPE_2);
    });
  });

  it('should sync storeType scope after manufacturerId update', () => {
    return StoreType.update({manufacturerId: '1'}, {where: {id: STORETYPE_ID_2}}).then(() => {
      return syncAdapter.sync(STORETYPE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreType.findOne({where: {id: STORETYPE_ID_2}});
    }).then(storeType => {
      should.exist(storeType);
      should.exist(storeType.scope);
      storeType.scope.should.be.an('array');
      storeType.scope.should.be.eql(STORETYPE_SCOPE_1);
    });
  });
});
