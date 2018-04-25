'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  PRODUCTCATEGORY_ID_1 = '1';

let syncAdapter,
  IntegrationAPIScopes;

describe('SG syncProductCategoryScope service test', () => {
  before(() => helpers.createProductCategories(true).then(() => {
    syncAdapter = new SGAdapterService.SyncProductCategoryScope();
    IntegrationAPIScopes = sails.config.scopesMatchList.map(({name}) => name);
  }));

  after(() => helpers.clearAllTables());

  it('should sync productCategory scope', () => {
    return ProductCategory.findOne({where: {id: PRODUCTCATEGORY_ID_1}}).then(productCategory => {
      should.exist(productCategory);
      should.exist(productCategory.scope);
      productCategory.scope.should.be.an('array');
      productCategory.scope.should.be.an.empty;

      return syncAdapter.sync(PRODUCTCATEGORY_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return ProductCategory.findOne({where: {id: PRODUCTCATEGORY_ID_1}});
    }).then(productCategory => {
      should.exist(productCategory);
      should.exist(productCategory.scope);
      productCategory.scope.should.be.an('array');
      productCategory.scope.should.be.eql(IntegrationAPIScopes);
    });
  });

  it('should sync productCategory scope after manufacturerId update', () => {
    return ProductCategory.update({manufacturerId: '1'}, {where: {id: PRODUCTCATEGORY_ID_1}}).then(() => {
      return syncAdapter.sync(PRODUCTCATEGORY_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return ProductCategory.findOne({where: {id: PRODUCTCATEGORY_ID_1}});
    }).then(productCategory => {
      should.exist(productCategory);
      should.exist(productCategory.scope);
      productCategory.scope.should.be.an('array');
      productCategory.scope.should.be.eql(IntegrationAPIScopes);
    });
  });
});
