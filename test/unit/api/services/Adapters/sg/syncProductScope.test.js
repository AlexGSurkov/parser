'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  PRODUCT_ID_1 = '1',
  PRODUCT_SCOPE_1 = ['JDE'],
  PRODUCT_SCOPE_2 = ['MNDLZ'];

let syncAdapter;

describe('SG syncProductScope service test', () => {
  before(() => helpers.createProducts(true).then(() => {
    syncAdapter = new SGAdapterService.SyncProductScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync product scope', () => {
    return Product.findOne({where: {id: PRODUCT_ID_1}}).then(product => {
      should.exist(product);
      should.exist(product.scope);
      product.scope.should.be.an('array');
      product.scope.should.be.an.empty;

      return syncAdapter.sync(PRODUCT_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Product.findOne({where: {id: PRODUCT_ID_1}});
    }).then(product => {
      should.exist(product);
      should.exist(product.scope);
      product.scope.should.be.an('array');
      product.scope.should.be.eql(PRODUCT_SCOPE_1);
    });
  });

  it('should sync product scope after manufacturerId update', () => {
    return Product.update({manufacturerId: '2'}, {where: {id: PRODUCT_ID_1}}).then(() => {
      return syncAdapter.sync(PRODUCT_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Product.findOne({where: {id: PRODUCT_ID_1}});
    }).then(product => {
      should.exist(product);
      should.exist(product.scope);
      product.scope.should.be.an('array');
      product.scope.should.be.eql(PRODUCT_SCOPE_2);
    });
  });
});
