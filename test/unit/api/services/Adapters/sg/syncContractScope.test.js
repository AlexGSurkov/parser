'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  CONTRACT_ID_1 = '1',
  CONTRACT_ID_2 = '2',
  CONTRACT_SCOPE_1 = ['JDE'],
  CONTRACT_SCOPE_2 = ['MNDLZ'];

let syncAdapter;

describe('SG syncContractScope service test', () => {
  before(() => helpers.createContracts(true).then(() => {
    syncAdapter = new SGAdapterService.SyncContractScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync contract scope (first time)', () => {
    return Contract.findOne({where: {id: CONTRACT_ID_1}}).then(contract => {
      should.exist(contract);
      should.exist(contract.scope);
      contract.scope.should.be.an('array');
      contract.scope.should.be.an.empty;

      return syncAdapter.sync(CONTRACT_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Contract.findOne({where: {id: CONTRACT_ID_1}});
    }).then(contract => {
      should.exist(contract);
      should.exist(contract.scope);
      contract.scope.should.be.an('array');
      contract.scope.should.be.eql(CONTRACT_SCOPE_1);
    });
  });

  it('should sync contract scope (second time) after caching', () => {
    return Contract.findOne({where: {id: CONTRACT_ID_2}}).then(contract => {
      should.exist(contract);
      should.exist(contract.scope);
      contract.scope.should.be.an('array');
      contract.scope.should.be.an.empty;

      return syncAdapter.sync(CONTRACT_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Contract.findOne({where: {id: CONTRACT_ID_2}});
    }).then(contract => {
      should.exist(contract);
      should.exist(contract.scope);
      contract.scope.should.be.an('array');
      contract.scope.should.be.eql(CONTRACT_SCOPE_2);
    });
  });

  it('should sync contract scope after manufacturerId update', () => {
    return Contract.update({manufacturerId: '1'}, {where: {id: CONTRACT_ID_2}}).then(() => {
      return syncAdapter.sync(CONTRACT_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Contract.findOne({where: {id: CONTRACT_ID_2}});
    }).then(contract => {
      should.exist(contract);
      should.exist(contract.scope);
      contract.scope.should.be.an('array');
      contract.scope.should.be.eql(CONTRACT_SCOPE_1);
    });
  });
});
