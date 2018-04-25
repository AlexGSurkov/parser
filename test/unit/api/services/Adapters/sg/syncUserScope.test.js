'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  USER_ID_1 = '1',
  USER_ID_2 = '2',
  USER_ID_3 = '3',
  USER_SCOPE_1 = ['JDE', 'MNDLZ'],
  USER_SCOPE_2 = ['JDE'],
  USER_SCOPE_3 = ['MNDLZ'];

let syncAdapter;

describe('SG syncUserScope service test', () => {
  before(() => helpers.createUsersManufacturer(true).then(() => {
    syncAdapter = new SGAdapterService.SyncUserScope();
  }));

  after(() => helpers.clearAllTables());

  it('should sync user scope (first time)', () => {
    return User.findOne({where: {id: USER_ID_2}}).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.an.empty;

      return syncAdapter.sync(USER_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return User.findOne({where: {id: USER_ID_2}});
    }).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.eql(USER_SCOPE_2);
    });
  });

  it('should sync user scope (second time) after caching', () => {
    return User.findOne({where: {id: USER_ID_3}}).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.an.empty;

      return syncAdapter.sync(USER_ID_3, helpers.AUTH_TOKEN);
    }).then(() => {
      return User.findOne({where: {id: USER_ID_3}});
    }).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.eql(USER_SCOPE_3);
    });
  });

  it('should sync user scope for all user manufacturers', () => {
    return User.findOne({where: {id: USER_ID_1}}).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.an.empty;

      return syncAdapter.sync(USER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return User.findOne({where: {id: USER_ID_1}});
    }).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.eql(USER_SCOPE_1);
    });
  });

  it('should sync user scope and avoid scopes not included in scopesMatchList', () => {
    return User.update({scope: ['JDE', 'TOTAL']}, {where: {id: USER_ID_1}}).then(() => {
      return syncAdapter.sync(USER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return User.findOne({where: {id: USER_ID_1}});
    }).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.eql(['TOTAL', ...USER_SCOPE_1]);
    });
  });

  it('should sync user scope after manufacturerId update', () => {
    return UserManufacturer.update({manufacturerId: '1'}, {where: {userId: USER_ID_3}}).then(() => {
      return syncAdapter.sync(USER_ID_3, helpers.AUTH_TOKEN);
    }).then(() => {
      return User.findOne({where: {id: USER_ID_3}});
    }).then(user => {
      should.exist(user);
      should.exist(user.scope);
      user.scope.should.be.an('array');
      user.scope.should.be.eql(USER_SCOPE_2);
    });
  });
});
