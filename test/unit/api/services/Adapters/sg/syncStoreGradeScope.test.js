'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  STOREGRADE_ID_1 = '1',
  STOREGRADE_ID_2 = '2',
  STOREGRADE_SCOPE_1 = ['JDE'],
  STOREGRADE_SCOPE_2 = ['MNDLZ'];

let syncAdapter;

describe('SG syncStoreGradeScope service test', () => {
  before(() => helpers.createStoreGrades(true).then(() => {
    syncAdapter = new SGAdapterService.SyncStoreGradeScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync storeGrade scope (first time)', () => {
    return StoreGrade.findOne({where: {id: STOREGRADE_ID_1}}).then(storeGrade => {
      should.exist(storeGrade);
      should.exist(storeGrade.scope);
      storeGrade.scope.should.be.an('array');
      storeGrade.scope.should.be.an.empty;

      return syncAdapter.sync(STOREGRADE_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreGrade.findOne({where: {id: STOREGRADE_ID_1}});
    }).then(storeGrade => {
      should.exist(storeGrade);
      should.exist(storeGrade.scope);
      storeGrade.scope.should.be.an('array');
      storeGrade.scope.should.be.eql(STOREGRADE_SCOPE_1);
    });
  });

  it('should sync storeGrade scope (second time) after caching', () => {
    return StoreGrade.findOne({where: {id: STOREGRADE_ID_2}}).then(storeGrade => {
      should.exist(storeGrade);
      should.exist(storeGrade.scope);
      storeGrade.scope.should.be.an('array');
      storeGrade.scope.should.be.an.empty;

      return syncAdapter.sync(STOREGRADE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreGrade.findOne({where: {id: STOREGRADE_ID_2}});
    }).then(storeGrade => {
      should.exist(storeGrade);
      should.exist(storeGrade.scope);
      storeGrade.scope.should.be.an('array');
      storeGrade.scope.should.be.eql(STOREGRADE_SCOPE_2);
    });
  });

  it('should sync storeGrade scope after manufacturerId update', () => {
    return StoreGrade.update({manufacturerId: '1'}, {where: {id: STOREGRADE_ID_2}}).then(() => {
      return syncAdapter.sync(STOREGRADE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return StoreGrade.findOne({where: {id: STOREGRADE_ID_2}});
    }).then(storeGrade => {
      should.exist(storeGrade);
      should.exist(storeGrade.scope);
      storeGrade.scope.should.be.an('array');
      storeGrade.scope.should.be.eql(STOREGRADE_SCOPE_1);
    });
  });
});
