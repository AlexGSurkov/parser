'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  PRICETYPE_ID_1 = '1',
  PRICETYPE_ID_2 = '2',
  PRICETYPE_SCOPE_1 = ['JDE'],
  PRICETYPE_SCOPE_2 = ['MNDLZ'],
  PRICETYPE_1_CONTRACT_ID = '1',
  PRICETYPE_2_CONTRACT_ID = '4',
  PRICETYPE_1_CONTRACT_EXTERNAL = 'JDE1828',
  PRICETYPE_2_CONTRACT_EXTERNAL = 'MNDLZ9994';

let syncPriceTypeAdapter,
  syncContractAdapter;

describe('SG syncPriceTypeContract service test', () => {
  before(() => helpers.createPriceTypes(true).then(() => {
    syncContractAdapter = new SGAdapterService.SyncContractScope();
    syncPriceTypeAdapter = new SGAdapterService.SyncPriceTypeContract();
  }));

  after(() => helpers.clearAllTables());

  it('should sync priceType scope (first time)', () => {
    return PriceType.findOne({where: {id: PRICETYPE_ID_1}}).then(priceType => {
      should.exist(priceType);
      should.exist(priceType.scope);
      should.exist(priceType.contractExternalKey);
      should.not.exist(priceType.contractId);
      priceType.scope.should.be.an('array');
      priceType.scope.should.be.an.empty;
      priceType.contractExternalKey.should.be.eql(PRICETYPE_1_CONTRACT_EXTERNAL);

      return syncContractAdapter.sync(PRICETYPE_1_CONTRACT_ID, helpers.AUTH_TOKEN);
    }).then(() => {
      return syncPriceTypeAdapter.sync(PRICETYPE_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return PriceType.findOne({where: {id: PRICETYPE_ID_1}});
    }).then(priceType => {
      should.exist(priceType);
      should.exist(priceType.scope);
      should.exist(priceType.contractId);
      priceType.scope.should.be.an('array');
      priceType.scope.should.be.eql(PRICETYPE_SCOPE_1);
      priceType.contractId.should.be.eql(PRICETYPE_1_CONTRACT_ID);
    });
  });

  it('should sync priceType scope (second time) after caching', () => {
    return PriceType.findOne({where: {id: PRICETYPE_ID_2}}).then(priceType => {
      should.exist(priceType);
      should.exist(priceType.scope);
      should.exist(priceType.contractExternalKey);
      should.not.exist(priceType.contractId);
      priceType.scope.should.be.an('array');
      priceType.scope.should.be.an.empty;
      priceType.contractExternalKey.should.be.eql(PRICETYPE_2_CONTRACT_EXTERNAL);

      return syncContractAdapter.sync(PRICETYPE_2_CONTRACT_ID, helpers.AUTH_TOKEN);
    }).then(() => {
      return syncPriceTypeAdapter.sync(PRICETYPE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return PriceType.findOne({where: {id: PRICETYPE_ID_2}});
    }).then(priceType => {
      should.exist(priceType);
      should.exist(priceType.scope);
      should.exist(priceType.contractId);
      priceType.scope.should.be.an('array');
      priceType.scope.should.be.eql(PRICETYPE_SCOPE_2);
      priceType.contractId.should.be.eql(PRICETYPE_2_CONTRACT_ID);
    });
  });

  it('should sync priceType scope after contract manufacturerId update', () => {
    return Contract.update({manufacturerId: '1'}, {where: {id: PRICETYPE_2_CONTRACT_ID}}).then(() => {
      return syncContractAdapter.sync(PRICETYPE_2_CONTRACT_ID, helpers.AUTH_TOKEN);
    }).then(() => {
      return syncPriceTypeAdapter.sync(PRICETYPE_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return PriceType.findOne({where: {id: PRICETYPE_ID_2}});
    }).then(priceType => {
      should.exist(priceType);
      should.exist(priceType.scope);
      should.exist(priceType.contractId);
      priceType.scope.should.be.an('array');
      priceType.scope.should.be.eql(PRICETYPE_SCOPE_1);
      priceType.contractId.should.be.eql(PRICETYPE_2_CONTRACT_ID);
    });
  });
});
