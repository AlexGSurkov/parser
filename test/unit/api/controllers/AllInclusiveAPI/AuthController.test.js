const should = require('chai').should(),
  request = require('supertest'),
  helpers = require(__basedir + '/helpers');


describe('AllInclusiveAPI AuthController test', () => {

  before(() => {
    return Promise.all([
      User.bulkCreate(helpers.getFixtures('users')),
      RBACPermissionGroup.bulkCreate(helpers.getFixtures('rbac_permissions_groups')),
      RBACRole.bulkCreate(helpers.getFixtures('rbac_roles')),
    ]).then(() => {
      return Promise.all([
        RBACPermission.bulkCreate(helpers.getFixtures('rbac_permissions')),
        RBACRoleUser.bulkCreate(helpers.getFixtures('rbac_roles_users'))
      ]);
    }).then(() => {
      return RBACRolePermission.bulkCreate(helpers.getFixtures('rbac_roles_permissions'));
    });
  });

  after(() => helpers.clearAllTables());

  describe('#adminLogin action test', () => {
    it('it should response with error if user not found by phone', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin')
        .send({phone: '999999999999', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'Wrong phone number. Make sure of exact entries.'
          });
        });
    });

    it('it should response with error if password is not valid', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin')
        .send({phone: '380000000001', password: 'qwert'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'Password isn`t valid'
          });
        });
    });

    it('it should response with error if user have not admin access', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin')
        .send({phone: '380000000004', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'admin access denied!'
          });
        });
    });

    it('it should response with proper data', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin')
        .send({phone: '380000000001', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          should.equal(res.body.errorMsg, undefined);
          res.body.status.should.be.equal('ok');
          res.body.data.should.be.deep.equal({
            userId: '2',
            userPermissionCodes: [
              'hand_access',
              'admin_access',
              'sv_access'
            ],
            token: 'testtokenforgas',
            gaaURL: `http://${sails.config.microservices.GAA}/`
          });
        });
    });

  });


  describe('#adminLoginById action test', () => {
    it('it should response with error if user not found by id', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin/by/id')
        .send({id: '-1'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'User with id -1 not found.'
          });
        });
    });

    it('it should response with error if user have not admin access', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin/by/id')
        .send({id: '5'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'admin access denied!'
          });
        });
    });

    it('it should response with proper data', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/admin/signin/by/id')
        .send({id: '2'})
        .then(res => {
          res.body.should.exist;
          should.equal(res.body.errorMsg, undefined);
          res.body.status.should.be.equal('ok');
          res.body.data.should.be.deep.equal({
            userId: '2',
            userPermissionCodes: [
              'hand_access',
              'admin_access',
              'sv_access'
            ],
            token: 'testtokenforgas',
            gaaURL: `http://${sails.config.microservices.GAA}/`
          });
        });
    });

  });


  describe('#handLogin action test', () => {
    it('it should response with error if user not found by phone', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/signin')
        .send({phone: '999999999999', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'User not found'
          });
        });
    });

    it('it should response with error if password is not valid', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/signin')
        .send({phone: '380000000001', password: 'qwert'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'Password isn`t valid'
          });
        });
    });

    it('it should response with error if user have not hand access', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/signin')
        .send({phone: '380000000000', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          res.body.should.deep.equal({
            status: 'error',
            errorMsg: 'hand access denied!'
          });
        });
    });

    it('it should response with proper data', () => {
      return request(sails.hooks.http.app)
        .post('/allinclusive/auth/signin')
        .send({phone: '380000000001', password: 'qwerty'})
        .then(res => {
          res.body.should.exist;
          should.equal(res.body.errorMsg, undefined);
          res.body.status.should.be.equal('ok');
          res.body.data.should.be.deep.equal({
            userId: '2'
          });
        });
    });

  });
});
