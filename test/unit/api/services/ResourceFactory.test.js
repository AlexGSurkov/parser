'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');

describe('ResourceFactory Test', () => {

  after(() => helpers.clearAllTables());

  it('should recover resource', () => {
    return ResourceFactory.recover('User').then(resource => {
      resource.should.be.instanceof(Object);
      // resource.should.be.instanceof(SequelizeConnections[sails.config.models.connection].Model);

      let instance = resource.build({firstName: 'test001'});

      instance.should.be.instanceof(Object);
      instance.should.be.instanceof(resource);
      instance.firstName.should.be.eql('test001');
    });
  });

  it('should not validate user instance', () => {
    return ResourceFactory.recover('User').then(resource => {
      let instance = resource.build({
        firstName: 'test001',
        phone: '12348578'
      });

      return instance.validate({hooks: false});
    }).then(() => {
      throw new Error('Promise must be rejected');
    }).catch(err => {
      err.should.be.ok;
      (err.name === 'SequelizeValidationError').should.be.true;
    });
  });

  describe('#User resource test', () => {

    it('should store user', () => {

      let userResource, userInst, userInst2;

      return ResourceFactory.recover('User').then(resource => {
        userResource = resource;
        userInst = userResource.build({
          firstName: 'firstName_testuser1',
          id: 'user1',
          lastName: 'lastName_testuser2',
          phone: '380934687785'
        });

        return userInst.validate({hooks: false});
      }).then(() => {
        // should.not.exist(err);

        return userInst.save();
      }).then(() => {
        return userResource.find({where: {firstName: 'firstName_testuser1'}});
      }).then(newUserInst => {
        newUserInst.should.be.ok;
        (newUserInst.id === 'user1').should.be.true;

        userInst2 = userResource.build({
          firstName: 'firstName_testuser2',
          id: 'user2',
          lastName: 'lastName_testuser2',
          phone: '380934682222'
        });

        return userInst2.validate({hooks: false});
      }).then(() => {
        // should.not.exist(err);

        return userInst2.save();
      }).then(() => {
        return userResource.find({where: {id: 'user2'}});
      }).then(newUserInst => {
        newUserInst.should.be.ok;
      });
    });

  });

});
