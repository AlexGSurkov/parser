'use strict';

const helpers = require(__basedir + '/helpers'),
  GAS = require(__basedir + '/../GAA/GAS/client'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const should = chai.should();


describe('GAS API submodule test', () => {

  after(() => helpers.clearAllTables());

  describe('#CRUD for users', () => {
    let userData1 = {
        "email": "email1@example.com",
        "phone": "3809591" + parseInt(Math.random() * 89999 + 10000),
        "firstName": "AAA1",
        "lastName": "BBB1"
      },
      userData2 = {
        "email": "email2@example.com",
        "phone": "3809592" + parseInt(Math.random() * 89999 + 10000),
        "firstName": "AAA2",
        "lastName": "BBB2"
      },
      userData3 = {
        "email": "email3@example.com",
        "phone": "3809593" + parseInt(Math.random() * 89999 + 10000),
        "firstName": "AAA3",
        "lastName": "BBB3"
      },
      userId = null;

    /**
     * new instance + getData + getResourceName + getCopy
     */
    it('should create 2 new user instances, copy instance and check defaults', () => {
      let newUser1 = new GAS.entity.User(),
        newUser2 = new GAS.entity.User();

      (newUser1 instanceof GAS.entity.User).should.be.true;
      (newUser1 instanceof GAS.entity.Product).should.be.false;

      (newUser2 instanceof GAS.entity.User).should.be.true;

      newUser1.should.not.be.equal(newUser2);

      newUser1.getData().should.be.empty;
      newUser1.getResourceName().should.be.equal('User');


      let user1Copy = newUser1.getCopy();

      (user1Copy instanceof GAS.entity.User).should.be.true;
      (user1Copy instanceof GAS.entity.Product).should.be.false;

      user1Copy.should.not.be.equal(newUser1);

      user1Copy.getData().should.be.empty;
      user1Copy.getResourceName().should.be.equal('User');
    });


    /**
     * create
     */
    it('should create 3 new users with correct UUID v4 ids', () => {
      return Promise.all([
        GAS.entity.User.create(userData1),
        GAS.entity.User.create(userData2),
        GAS.entity.User.create(userData3)
      ]).then(usersData => {
        userId = usersData[2].getData('id');
        userId.should.be.a('string').and.have.length(36);
      });
    });


    /**
     * find
     */
    it('should find all users and their count must be 3', () => {
      return GAS.entity.User.find().then(users => {
        users.should.have.length(3);
      });
    });

    /**
     * find + query
     */
    it('should find one user by query with id and should be only one user', () => {
      return GAS.entity.User.find({query: {id: userId}}).then(users => {
        users.should.have.length(1);
        users[0].getData('id').should.be.equal(userId);
      });
    });

    /**
     * find + query + attrs (include array)
     */
    it('should find user by query and attributes and check received attributes', () => {
      return GAS.entity.User.find({
        query: {
          id: userId
        },
        attributes: ['email', 'firstName', 'lastName']
      }).then(users => {
        users.should.have.length(1);
        let userData = users[0].getData();
        // sequelize added 1 password field that hides hash (getter for password is called notwithstanding from attrs)

        Object.keys(userData).should.have.length(3 + 1);

        userData.should.have.property('email');
        userData.should.have.property('firstName');
        userData.should.have.property('lastName');
        userData.should.have.property('password');
      });
    });

    /**
     * find + query + attrs (exclude array)
     */
    it('should find user by query and exclude attributes and check received attributes', () => {
      return GAS.entity.User.find({
        query: {
          id: userId
        },
        attributes: {
          exclude: ['email', 'firstName', 'lastName']
        }
      }).then(users => {
        users.should.have.length(1);
        users[0].getData().should.not.have.property('email');
        users[0].getData().should.not.have.property('firstName');
        users[0].getData().should.not.have.property('lastName');
      });
    });

    /**
     * find + query + attrs (one include - string)
     */
    it('should find user by query and one attribute and check received attribute', () => {
      return GAS.entity.User.find({
        query: {
          id: userId
        },
        attributes: 'lastName'
      }).then(users => {
        users.should.have.length(1);
        let userData = users[0].getData();

        Object.keys(userData).should.have.length(1 + 1);    // +1 is password

        userData.should.have.property('lastName');
        userData.should.have.property('password');
      });
    });

    /**
     * find + sort DESC
     */
    it('should find users with sorting and check sorting order to be "firstName:desc"', () => {
      return GAS.entity.User.find({
        sort: 'firstName:desc'
      }).then(users => {
        users.should.have.length(3);
        users[0].getData('firstName').should.be.equal('AAA3');
        users[1].getData('firstName').should.be.equal('AAA2');
        users[2].getData('firstName').should.be.equal('AAA1');
      });
    });

    /**
     * find + sort ASC
     */
    it('should find users with sorting and check sorting order to be "firstName:asc"', () => {
      return GAS.entity.User.find({
        sort: 'firstName:asc'
      }).then(users => {
        users.should.have.length(3);
        users[0].getData('firstName').should.be.equal('AAA1');
        users[1].getData('firstName').should.be.equal('AAA2');
        users[2].getData('firstName').should.be.equal('AAA3');
      });
    });

    /**
     * find + sort + limit (version 1)
     */
    it('should find users with offset, limit and sorting DESC and check response', () => {
      return GAS.entity.User.find({
        offset: 1,
        limit: 2,
        sort: 'firstName:desc'
      }).then(users => {
        users.should.have.length(2);
        users[0].getData('firstName').should.be.equal('AAA2');
        users[1].getData('firstName').should.be.equal('AAA1');
      });
    });

    /**
     * find + sort + limit (version 2)
     */
    it('should find users with offset, limit and sorting ASC and check response', () => {
      return GAS.entity.User.find({
        offset: 2,
        limit: 1,
        sort: 'firstName:asc'
      }).then(users => {
        users.should.have.length(1);
        users[0].getData('firstName').should.be.equal('AAA3');
      });
    });


    /**
     * findById + getData + compare
     */
    it('should find user by id and all fields must be equal', () => {
      return GAS.entity.User.findById(userId).then(userClass => {
        // check id using DAO getter
        userClass.getData('id').should.be.equal(userId);

        let user = userClass.getData();

        // check id using raw object
        user.id.should.be.equal(userId);

        Object.keys(userData3).forEach(key => {
          user.should.have.property(key);
          userData3[key].should.be.equal(user[key]);
        });
      });
    });

    /**
     * findById + setData + save + update + remove + reload
     */
    it('should find user by id and update field using instance and static class methods, remove and reload with expected error', () => {
      let _getNewFirstName = () => "AAA3_" + parseInt(Math.random() * 9999999),
        newFirstName = null;

      return GAS.entity.User.findById(userId).then(userClass => {
        newFirstName = _getNewFirstName();
        userClass.setData('firstName', newFirstName);
        // update: instance method
        return userClass.save();

      }).then(userClass => {
        userClass.getData('firstName').should.be.equal(newFirstName);
        return userClass.reload();

      }).then(userClass => {
        userClass.getData('firstName').should.be.equal(newFirstName);

        newFirstName = _getNewFirstName();
        let user = userClass.getData();

        user.firstName = newFirstName;
        // update: static class method
        return GAS.entity.User.update(user);

      }).then(userClass => {
        userClass.getData('firstName').should.be.equal(newFirstName);
        return userClass.reload();

      }).then(userClass => {
        userClass.getData('firstName').should.be.equal(newFirstName);
        return userClass.remove();

      }).then(userClass => {
        userClass.getData().should.be.empty;

        userClass.setData('id', userId);

        return userClass.reload().should.eventually.be.rejected;
      });
    });


    /**
     * count + find ("firstName" IN)
     */
    it('should count users and make find request ("firstName" IN)', () => {
      let query = {
        firstName: ['AAA1', 'AAA2']
      };

      return Promise.all([
        GAS.entity.User.find({query}),
        GAS.entity.User.count({query})
      ]).then(responses => {
        let [users, count] = responses;

        count.should.be.equal(2);
        users.should.have.length(count);
      });
    });

    /**
     * count + find (email LIKE)
     */
    it('should count users and make find request (email LIKE)', () => {
      let query = {
        email: {
          $like: 'email2%'
        }
      };

      return Promise.all([
        GAS.entity.User.find({query}),
        GAS.entity.User.count({query})
      ]).then(responses => {
        let [users, count] = responses;

        count.should.be.equal(1);
        users.should.have.length(count);
      });
    });


    /**
     * create + del
     */
    it('should test static del method', () => {
      return GAS.entity.User.create(userData1).then(userClass => {
        let id = userClass.getData('id');

        return GAS.entity.User.del(id).then(() => {
          return userClass.reload().then(() => {
            throw new Error('Promise should be rejected');
          }).catch(e => {
            e.message.should.be.equal(`GAS api: resource "User", "reload" failed with error «Resource "User" with id "${id}" not found.»`);
          });
        });
      });
    });

  });


  describe('#Wrong parameters for methods', () => {
    /**
     * new instance
     */
    it('should throw error with creating new instance of user', done => {
      try {
        new GAS.entity.User(null);

        done(new Error('Error with creating new user instance, data validation for new instance is not passed'));
      } catch (e) {
        e.message.should.be.equal('When constructing new class "User" data must be object!');
        done();
      }
    });


    /**
     * find + wrong input object
     */
    it('should throw error when find gets wrong input object', () => {
      return GAS.entity.User.find(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "find" needs object as parameter!');
      });
    });

    /**
     * find + wrong offset param
     */
    it('should throw error when find gets wrong offset param (remote iAPI validation checking)', () => {
      return GAS.entity.User.find({
        offset: -1000
      }).should.eventually.be.rejected;
    });

    /**
     * find + wrong limit param
     */
    it('should throw error when find gets wrong limit param (remote iAPI validation checking)', () => {
      return GAS.entity.User.find({
        limit: -1000
      }).should.eventually.be.rejected;
    });

    /**
     * find + wrong query param
     */
    it('should throw error when find gets wrong query param (remote iAPI validation checking)', () => {
      return GAS.entity.User.find({
        query: {
          blaBla: 'test'
        }
      }).should.eventually.be.rejected;
    });

    /**
     * find + wrong attributes param
     */
    it('should throw error when find gets wrong attributes param (remote iAPI validation checking)', () => {
      return GAS.entity.User.find({
        attributes: [null]
      }).should.eventually.be.rejected;
    });


    /**
     * findById + no id
     */
    it('should throw error for findById with no id', () => {
      return GAS.entity.User.findById().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * findById + wrong id
     */
    it('should throw error for findById with wrong id', () => {
      return GAS.entity.User.findById(true).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * findById + non-existent id
     */
    it('should throw error for findById with non-existent id', () => {
      return GAS.entity.User.findById('non-existent-id').then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "findById" failed with error «Resource "User" with id "non-existent-id" not found.»');
      });
    });


    /**
     * count + wrong input object
     */
    it('should throw error when count gets wrong input object', () => {
      return GAS.entity.User.count(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "count" needs object as parameter!');
      });
    });

    /**
     * count + wrong query param
     */
    it('should throw error when count gets wrong query param (remote iAPI validation checking)', () => {
      return GAS.entity.User.count({
        query: {
          blaBla: 'test'
        }
      }).should.eventually.be.rejected;
    });


    /**
     * create + wrong input object
     */
    it('should throw error when create gets wrong input object', () => {
      return GAS.entity.User.create(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "create" needs object as parameter!');
      });
    });

    /**
     * create + empty input object
     */
    it('should throw error when create gets empty input object', () => {
      return GAS.entity.User.create().should.eventually.be.rejected;
    });

    /**
     * create + wrong params
     */
    it('should throw error when create gets wrong params', () => {
      return GAS.entity.User.create({
        firstName: 'Test',
        lastName: 'Test',
        email: 'wrong mail',
        phone: 'hello'
      }).should.eventually.be.rejected;
    });


    /**
     * update + wrong input object
     */
    it('should throw error when update gets wrong input object', () => {
      return GAS.entity.User.update(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "update" needs object as parameter!');
      });
    });

    /**
     * update + empty input object
     */
    it('should throw error when update gets empty input object', () => {
      return GAS.entity.User.update().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * update + non-existent id
     */
    it('should throw error when update for non-existent id', () => {
      return GAS.entity.User.update({
        id: 'non-existent-id'
      }).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "update" failed with error «Resource "User" with id "non-existent-id" not found.»');
      });
    });

    /**
     * update + wrong input param
     */
    it('should throw error for wrong update method param (instance)', () => {
      return GAS.entity.User.update(new GAS.entity.User()).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Static method "update" doesnt support instance as parameter, use "save" method on instance instead');
      });
    });


    /**
     * del + no id
     */
    it('should throw error for del with no id', () => {
      return GAS.entity.User.del().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * del + wrong id
     */
    it('should throw error for del with wrong id', () => {
      return GAS.entity.User.del(true).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * del + non-existent id
     */
    it('should throw error for del with non-existent id', () => {
      return GAS.entity.User.del('non-existent-id').then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "del" failed with error «Item with id "non-existent-id" not found»');
      });
    });


    /**
     * save + wrong input param
     */
    it('should throw error for wrong save method param', () => {
      let newUser = new GAS.entity.User();

      return newUser.save(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "save" needs object as parameter!');
      });
    });

    /**
     * save + no id
     */
    it('should throw error for save method with no id', () => {
      let newUser = new GAS.entity.User();

      return newUser.save().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * save + non-existent id
     */
    it('should throw error when save for non-existent id', () => {
      let newUser = new GAS.entity.User({
        id: 'non-existent-id'
      });

      return newUser.save().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "save" failed with error «Resource "User" with id "non-existent-id" not found.»');
      });
    });


    /**
     * remove + wrong input param
     */
    it('should throw error for wrong remove method param', () => {
      let newUser = new GAS.entity.User();

      return newUser.remove(null).then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('Method "remove" needs object as parameter!');
      });
    });

    /**
     * remove + no id
     */
    it('should throw error for remove method with no id', () => {
      let newUser = new GAS.entity.User();

      return newUser.remove().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * remove + non-existent id
     */
    it('should throw error when remove for non-existent id', () => {
      let newUser = new GAS.entity.User({
        id: 'non-existent-id'
      });

      return newUser.remove().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "remove" failed with error «Item with id "non-existent-id" not found»');
      });
    });


    /**
     * reload + no id
     */
    it('should throw error for reload method with no id', () => {
      let newUser = new GAS.entity.User();

      return newUser.reload().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * reload + wrong id
     */
    it('should throw error for reload method with wrong id', () => {
      let newUser = new GAS.entity.User({
        id: true
      });

      return newUser.reload().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('ID must be either string or number and it must be set!');
      });
    });

    /**
     * reload + non-existent id
     */
    it('should throw error when reload for non-existent id', () => {
      let newUser = new GAS.entity.User({
        id: 'non-existent-id'
      });

      return newUser.reload().then(() => {
        throw new Error('Promise should be rejected');
      }).catch(e => {
        e.message.should.be.equal('GAS api: resource "User", "reload" failed with error «Resource "User" with id "non-existent-id" not found.»');
      });
    });

  });


  describe('#Other methods tests', () => {
    it('should test getData method behavior', () => {
      let userClass = new GAS.entity.User({
        firstName: "AAA1",
        lastName: "BBB1"
      });

      userClass.getData('firstName').should.be.equal('AAA1');
      userClass.getData('lastName').should.be.equal('BBB1');
      userClass.getData().should.deep.equal({
        firstName: "AAA1",
        lastName: "BBB1"
      });
      userClass.getData(null).should.deep.equal({
        firstName: "AAA1",
        lastName: "BBB1"
      });
      should.equal(userClass.getData(true), null);
      should.equal(userClass.getData('NON-EXISTENT-KEY'), null);
    });


    it('should test setData method behavior', () => {
      let userClass = new GAS.entity.User();

      userClass.setData('firstName', 'AAA').should.be.equal(userClass);

      userClass
        .setData('lastName', 'BBB')
        .setData('phone', '380931234567').should.be.equal(userClass);

      userClass
        .setData('SOME_FIELD_1', 2000)
        .setData('SOME_FIELD_2', true)
        .setData('SOME_FIELD_3', {})
        .setData('SOME_FIELD_4', null)
        .setData('SOME_FIELD_5', undefined)           // this will be null
        .setData('SOME_FIELD_6', ['test'])
        .getData()
        .should.deep.equal(userClass.getData());

      userClass
        .setData('SOME_FIELD_7', '')
        .getData()
        .should.deep.equal(
        {
          firstName: 'AAA',
          lastName: 'BBB',
          phone: '380931234567',
          SOME_FIELD_1: 2000,
          SOME_FIELD_2: true,
          SOME_FIELD_3: {},
          SOME_FIELD_4: null,
          SOME_FIELD_5: null,       // "undefined" replaced by default "null" value
          SOME_FIELD_6: ['test'],
          SOME_FIELD_7: ''
        }
      );
    });


    it('should test toJSON serialization method', () => {
      let userClass = new GAS.entity.User({
          firstName: "AAA1",
          lastName: "BBB1"
        }),
        userData = userClass.getData();

      JSON.stringify(userClass).should.be.equal(JSON.stringify(userData));
    });

  });

});
