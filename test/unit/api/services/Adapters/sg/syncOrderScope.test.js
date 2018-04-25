'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  ORDER_ID_1 = '1',
  ORDER_ID_2 = '2',
  ORDER_SCOPE_1 = ['JDE'],
  ORDER_SCOPE_2 = ['MNDLZ'];

let syncAdapter;

describe('SG syncOrderScope service test', () => {
  before(() => helpers.createOrders(true).then(() => {
    syncAdapter = new SGAdapterService.SyncOrderScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync order scope (first time)', () => {
    return Order.findOne({where: {id: ORDER_ID_1}}).then(order => {
      should.exist(order);
      should.exist(order.scope);
      order.scope.should.be.an('array');
      order.scope.should.be.an.empty;

      return syncAdapter.sync(ORDER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Order.findOne({where: {id: ORDER_ID_1}});
    }).then(order => {
      should.exist(order);
      should.exist(order.scope);
      order.scope.should.be.an('array');
      order.scope.should.be.eql(ORDER_SCOPE_1);
    });
  });

  it('should sync order scope (second time) after caching', () => {
    return Order.findOne({where: {id: ORDER_ID_2}}).then(order => {
      should.exist(order);
      should.exist(order.scope);
      order.scope.should.be.an('array');
      order.scope.should.be.an.empty;

      return syncAdapter.sync(ORDER_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Order.findOne({where: {id: ORDER_ID_2}});
    }).then(order => {
      should.exist(order);
      should.exist(order.scope);
      order.scope.should.be.an('array');
      order.scope.should.be.eql(ORDER_SCOPE_2);
    });
  });

  it('should sync order scope after manufacturerId update', () => {
    return Order.update({manufacturerId: '1'}, {where: {id: ORDER_ID_2}}).then(() => {
      return syncAdapter.sync(ORDER_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Order.findOne({where: {id: ORDER_ID_2}});
    }).then(order => {
      should.exist(order);
      should.exist(order.scope);
      order.scope.should.be.an('array');
      order.scope.should.be.eql(ORDER_SCOPE_1);
    });
  });
});
