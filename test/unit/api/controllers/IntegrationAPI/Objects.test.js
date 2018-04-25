'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  assert = require('assert'),
  bcrypt = require('bcrypt-nodejs'),
  _ = require('lodash'),
  helpers = require(__basedir + '/helpers');

let ValidTests = [
  {
    resourceName: 'User',
    tests: [
      {
        id: 'qw12',
        firstName: 'first_name_002',
        lastName: 'last_name_002',
        middleName: 'middle_name_002',
        login: 'login_test002',
        phone: '380934682220',
        email: 'test002@test.com'
      },
      {
        id: 'qw18',
        firstName: 'first_name_003',
        lastName: 'last_name_003',
        middleName: 'middle_name_003',
        login: 'login_test003',
        phone: '380934682227',
        email: 'test003@test.com'
      },
      {
        id: 'qw19',
        firstName: 'first_name_004',
        lastName: 'last_name_004',
        middleName: 'middle_name_004',
        login: 'login_test004',
        password: {
          post: () => {
            return 'qwerty';
          },
          skipDbQuery: true
        },
        phone: '380934682224',
        email: 'test004@test.com'
      },
      {
        firstName: 'first_name_005',
        lastName: 'last_name_005',
        middleName: 'middle_name_005',
        login: 'login_test005',
        phone: '380934682226',
        email: 'test005@test.com'
      },
      {
        "firstName": "Гарденайз",
        "lastName": "Супервайзер",
        "login": "supervisor1",
        "phone": '380934682228',
        "province": "Киевская обл.",
        "city": "Киев",
        "address": "ул. павла Тычины 1-в",
        "id": 1
      }
    ],
    query: [
      {
        $and: [{
          firstName: {
            $like: 'first_name_002%'
          }
        },
          {
            middleName: 'middle_name_002'
          }]
      },
      {
        $or: [{
          id: 'qw18'
        },
          {
            id: '??nonExists'
          }]
      }
    ]
  },
  {
    resourceName: 'Store',
    tests: [
      {
        id: 2,
        SWCode: "qw1",
        legalName: "ООО \"Дары востока\"",
        actualName: "ООО \"Дары востока\"",
        actualAddress: "пр-т Кирова, 64",
        legalAddress: "пр-т Кирова, 64",
        region: "Одесса",
        delay: 2,
        latitude: 1223.43,
        longitude: 2323.34
      },
      {
        id: 'qw2',
        SWCode: "qw2",
        legalName: "ООО \"Дары востока\"",
        actualName: "ООО \"Дары востока\"",
        actualAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        legalAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        region: "Одесса",
        delay: 3,
        latitude: 1123.43,
        longitude: 2323.34
      }
    ],
    query: [
      {
        $and: [{
          legalName: "ООО \"Дары востока\""
        },
          {
            legalAddress: "пр-т Кирова, 64"
          }]
      },
      {
        $or: [{
          id: 'qw2'
        },
          {
            id: '??nonExists'
          }]
      }
    ]
  },
  {
    resourceName: 'Manufacturer',
    tests: [
      {
        "id": "1",
        "name": "JDE"
      }
    ],
    query: [
      {
        id: "1"
      }
    ]
  },
  {
    resourceName: 'Order',
    tests: [
      {
        id: 100,
        orderNumber: 1,
        totalSum: 47.98,
        orderCreationDate: {
          post: () => {
            return "Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))";
          },
          get: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          },
          db: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          }
        },
        orderUpdateDate: {
          post: () => {
            return "Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))";
          },
          get: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          },
          db: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          }
        },
        paymentDate: {
          post: () => {
            return "Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))";
          },
          get: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          },
          db: () => {
            return new Date("Wed Dec 16 2015 17:49:49 GMT+0200 (Финляндия (зима))").toISOString();
          }
        },
        orderTypeBack: false,
        storeId: 2,
        userId: 'qw12',
        orderParentId: null,
        "contractNumber": "JDE5565",
        "manufacturerId": "1"
      },
      {
        id: 102,
        orderNumber: 2,
        totalSum: 49.98,
        orderCreationDate: {
          post: () => {
            return 1450361866916;
          },
          get: () => {
            return new Date(1450361866916).toISOString();
          },
          db: () => {
            return new Date(1450361866916).toISOString();
          }
        },
        orderUpdateDate: {
          post: () => {
            return 1450361866916;
          },
          get: () => {
            return new Date(1450361866916).toISOString();
          },
          db: () => {
            return new Date(1450361866916).toISOString();
          }
        },
        paymentDate: {
          post: () => {
            return 1450361866916;
          },
          get: () => {
            return new Date(1450361866916).toISOString();
          },
          db: () => {
            return new Date(1450361866916).toISOString();
          }
        },
        orderTypeBack: false,
        storeId: 2,
        userId: 'qw12',
        orderParentId: null,
        "contractNumber": "JDE5565",
        "manufacturerId": "1"
      }
    ],
    query: [
      {
        totalSum: 47.98
      },
      {
        $or: [{
          id: '100'
        },
          {
            id: '??nonExists'
          }]
      }
    ]
  }

];
let NotValidTests = [
  {
    resourceName: 'User',
    tests: [
      {
        middleName: 'middle_name_004',
        login: 'login_test004',
        phone: '32',
        email: 'test004@test.com'
      },
      {
        firstName: 'first_name_004',
        lastName: 2,
        middleName: 'middle_name_004',
        login: 'login_test004',
        phone: '42345678',
        email: 'email'
      },
      {
        firstName: "Гарденайз",
        lastName: "Супервайзер",
        login: "supervisor1",
        password: "qwerty",
        phone: "380000000000",
        province: "Киевская обл.",
        city: "Киев",
        address: "ул. павла Тычины 1-в",
        id: 1
      }
    ]
  },
  {
    resourceName: 'Store',
    tests: [
      {
        id: 1,
        SWCode: "qw1",
        legalName: 12,
        actualName: "ООО \"Дары востока\"",
        actualAddress: "пр-т Кирова, 64",
        legalAddress: "пр-т Кирова, 64",
        region: 1,
        latitude: 1223.43,
        longitude: 2323.34
      },
      {
        id: 'qw4',
        SWCode: "qw2",
        legalName: "ООО \"Дары востока\"",
        actualName: "ООО \"Дары востока\"",
        actualAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        legalAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        region: "Одесса",
        delay: 3
      }
    ]
  },
  {
    resourceName: 'Order',
    tests: [
      {
        id: 100,
        orderNumber: 1,
        totalSum: 'Сумма, просто сумма',
        orderCreationDate: "Новый год, конечно же!",
        orderUpdateDate: "4533qq",
        paymentDate: "двоичный код, вот: 101101",
        orderTypeBack: false,
        storeId: 2,
        userId: 'qw12',
        orderParentId: null
      },
      {
        id: 102,
        orderNumber: 1,
        totalSum: 47.98,
        orderCreationDate: 1450361866916,
        orderUpdateDate: 1450361866916,
        paymentDate: 1450361866916,
        orderTypeBack: "не вернули",
        storeId: "А такого ид нет",
        userId: 'qw12',
        orderParentId: "over9999"
      }
    ]
  }
];

describe('IntegrationAPI ObjectsController Test', () => {

  after(() => helpers.clearAllTables());

  describe("#POST", () => {

    it('should create user', () => {
      let userData = {
        firstName: 'first_name_001',
        lastName: 'last_name_001',
        phone: '380934682222',
        email: 'test001@test.com'
      };

      return helpers.makeRequest('post', '/api/resources/objects/user', userData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array');

          return User.findOne({
            where: {
              firstName: 'first_name_001'
            }
          });
        }).then(user => {
          should.exist(user);

          Object.keys(userData).forEach(prop => {
            (userData[prop] === user.get(prop)).should.be.true;
          });

          (user.id.length >= 36).should.be.true; // default id should be uuid
        });

    });

    it('should not create user Array request', () => {
      let userData = [{
        firstName: 'first_name_007',
        lastName: 'last_name_007',
        phone: '380934682222',
        email: 'test007@test.com'
      }];

      return helpers.makeRequest('post', '/api/resources/objects/user', userData).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
      });

    });


    it('should return error for not valide json', () => {
      let notValideJson = '{ "name": "supervisor",    "isHandAccess": true,    "isAdminAccess": false,    "isSupervisorAccess": true,    "isWriteAccess": false,    "id": 2,  }';

      return helpers.makeRequest('post', '/api/resources/objects/user', notValideJson)
        .set('Content-Type', 'application/json')
        .then(res => {
          res.status.should.be.eql(200);
          res.body.should.have.property('success', false);
          res.body.should.have.property('errors').which.is.an('array');
          res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
        });

    });


    it('should create user with password', () => {
      let userData = {
        firstName: 'first_name_001',
        lastName: 'last_name_001',
        phone: '380934682223',
        email: 'test001@test.com',
        password: 'qwerty'
      };

      let userId;

      return helpers.makeRequest('post', '/api/resources/objects/User', userData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array');
          res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
          res.body.should.have.property('User');
          res.body.User.should.have.property('id');

          userId = res.body.User.id;

          return ResourceFactory.recover('User');
        }).then(userResource => {
          should.exist(userResource);
          should.exist(userId);

          return userResource.find({
            where: {
              id: userId
            }
          });
        }).then(userInst => {
          should.exist(userInst);
          (userInst.password === '*').should.be.true;
          bcrypt.compareSync("qwerty", userInst.getDataValue('password')).should.be.true;
        });
    });

    ValidTests.forEach(resourceTests => {
      let numTest = 0;

      resourceTests.tests.forEach(testData => {

        it('should create ' + resourceTests.resourceName + ' - ' + ++numTest, () => {

          let sendTest = {};
          let query = {};

          for (let prop in testData) {
            if (testData.hasOwnProperty(prop)) {
              if (_.isPlainObject(testData[prop])) {
                sendTest[prop] = testData[prop].post();
                if (!testData[prop].skipDbQuery) {
                  query[prop] = testData[prop].db();
                }
              } else {
                sendTest[prop] = testData[prop];
                query[prop] = testData[prop] ? testData[prop].toString() : testData[prop];
              }
            }
          }

          return helpers.makeRequest(
            'post',
            '/api/resources/objects/' + resourceTests.resourceName,
            sendTest
          ).then(res => {
            res.body.should.have.property('success', true);
            res.body.should.have.property('errors').which.is.an('array');
            res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
            testData.id = res.body[resourceTests.resourceName].id;

            return ResourceFactory.recover(resourceTests.resourceName);
          }).then(resource => {
            should.exist(resource);

            return resource.find({where: query});
          }).then(instances => {
            should.exist(instances);
          });
        });
      });
    });

    NotValidTests.forEach(resourceTests => {
      let numTest = 0;

      resourceTests.tests.forEach(testData => {

        it('should get error when create ' + resourceTests.resourceName + ' - ' + ++numTest, () => {
          return helpers.makeRequest('post', '/api/resources/objects/' + resourceTests.resourceName, testData).then(res => {
            assert.equal(res.body.success, false);
            res.body.should.have.property('errors');
            res.body.should.have.property('errors').which.is.an('array');
            res.body.errors.length.should.be.above(0);
          });
        });
      });
    });


    it('should create RBAC role', () => {
      let roleData = {
        title: 'test role AAA'
      };

      return helpers.makeRequest('post', '/api/resources/objects/role', roleData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array');

          return RBACRole.findOne({
            where: {
              title: 'test role AAA'
            }
          });
        }).then(role => {
          should.exist(role);

          Object.keys(roleData).forEach(prop => {
            (roleData[prop] === role.get(prop)).should.be.true;
          });

          (role.id.length >= 36).should.be.true; // default id should be uuid
        });
    });


    it('should create RBAC role-user with default permission', () => {
      let roleData = {
        roleId: 'admin',
        userId: null
      }, userData = {
        firstName: 'ABCDEF001',
        lastName: 'last_name_001',
        phone: '380123456789',
        email: 'ABCDEF@gmail.com'
      };

      return RBACRole.create({id: 'admin', title: 'admin'}).then(() => {
        return helpers.makeRequest('post', '/api/resources/objects/user', userData);
      }).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');

        return User.findOne({
          where: {
            firstName: 'ABCDEF001'
          }
        });
      }).then(user => {
        roleData.userId = user.id;

        return helpers.makeRequest('post', '/api/resources/objects/RoleUser', roleData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array');

          return RBACRoleUser.findOne({
            where: {
              userId: user.id
            }
          });
        });
      }).then(roleUser => {
        should.exist(roleUser);

        Object.keys(roleData).forEach(prop => {
          (roleData[prop] === roleUser.get(prop)).should.be.true;
        });

        (roleUser.id.length >= 36).should.be.true; // default id should be uuid
      });
    });

  });


  describe("#GET", () => {

    ValidTests.forEach(resourceTests => {
      it('should return list of ' + resourceTests.resourceName, () => {

        return helpers.makeRequest('get', '/api/resources/objects/' + resourceTests.resourceName).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property(resourceTests.resourceName).which.is.an('array');
          res.body[resourceTests.resourceName].length.should.be.above(0);
        });
      });
    });

    ValidTests.forEach(resourceTests => {
      let numTest = 0;

      resourceTests.tests.forEach(testData => {

        it('should return one ' + resourceTests.resourceName + ' - ' + ++numTest, () => {
          return helpers.makeRequest('get', '/api/resources/objects/' + resourceTests.resourceName + '/' + testData.id).then(res => {
            res.body.should.have.property('success', true);
            res.body.should.have.property('errors').which.is.an('array');
            res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
          });
        });
      });
    });

  });


  describe("#GET with query", () => {

    ValidTests.forEach(resourceTests => {
      let numTest = 0;

      resourceTests.query.forEach(query => {

        it('should return one ' + resourceTests.resourceName + ' with query - ' + ++numTest, () => {

          query = encodeURIComponent(JSON.stringify(query));

          return helpers.makeRequest('get', '/api/resources/objects/' + resourceTests.resourceName + '?query=' + query).then(res => {
            res.body.should.have.property('success', true);
            res.body.should.have.property('errors').which.is.an('array');
            assert.equal(res.body[resourceTests.resourceName].length, 1);
            res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
          });
        });
      });
    });
  });


  describe("#PUT", () => {

    it('should not update unknown User', () => {

      let updateData = {firstName: 'new_first_name'};

      return helpers.makeRequest('put', '/api/resources/objects/User/1111-qqqq-wwww-eeee-rrrrr', updateData).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
      });
    });

    ValidTests.forEach(resourceTests => {
      let numTest = 0;

      resourceTests.tests.forEach(testData => {

        it('should update one ' + resourceTests.resourceName + ' - ' + ++numTest, () => {

          let updateData = {};

          switch (resourceTests.resourceName) {
            case 'User':
              updateData = {firstName: testData.firstName + '1'};
              break;
            case 'Store':
              updateData = {delay: testData.delay + 1};
              break;
            case 'Order':
              updateData = {totalSum: testData.totalSum * 2};
              break;
          }

          return helpers.makeRequest('put', '/api/resources/objects/' + resourceTests.resourceName + '/' + testData.id, updateData).then(res => {
            res.body.should.have.property('success', true);
            res.body.should.have.property('errors').which.is.an('array');
            res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);

            return ResourceFactory.recover(resourceTests.resourceName);
          }).then(resource => {
            return resource.findOne({where: updateData});
          }).then(instances => {
            should.exist(instances);
          });
        });
      });
    });
  });


  describe("#DELETE BY ID", () => {

    let numTest = 0;
    let resourceTest = ValidTests[3];

    it('should delete one ' + resourceTest.resourceName + ' - ' + ++numTest, () => {

      return helpers.makeRequest('delete', '/api/resources/objects/' + resourceTest.resourceName + '/' + resourceTest.tests[0].id).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
        res.body[resourceTest.resourceName].result.should.be.equal(1);
        return ResourceFactory.recover(resourceTest.resourceName);
      }).then(resource => {
        return resource.findOne({where: {id: resourceTest.tests[0].id}});
      }).then(result => {
        should.not.exist(result);
      });
    });
  });


  describe("#Count", () => {

    it('should return the number of ' + ValidTests[1].resourceName, () => {

      return helpers.makeRequest('get', '/api/resources/objects/' + ValidTests[1].resourceName + '/count').then(res => {
        res.body.should.have.property('success', true);
        res.body[ValidTests[1].resourceName].should.equal(ValidTests[1].tests.length);
      });
    });
  });


  // todo: refactor tests before it to make them not dependent from each other and delete this suit
  describe('#DROP DB to make tests independent', () => {
    before(() => helpers.clearAllTables());

    it('cleans DB', () => Promise.resolve());
  });

  /*----------------------INSERT new INDEPENDENT tests ONLY after this line----------------------------*/

  describe("#DELETE MASS", () => {

    before(() => helpers.createStores());

    after(() => Store.destroy({where: {}}));

    it('should delete by query', () => {

      let query = {id: ['1', '2']};

      return helpers.makeRequest('delete', '/api/resources/objects/store?query=' + JSON.stringify(query)).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
        res.body.store.result.should.be.equal(query.id.length);

        return Store.findAll();
      }).then(result => {
        result.length.should.be.equal(4 - query.id.length);
      });
    });

    it('should not delete with empty query', () => {

      let query = {};

      return helpers.makeRequest('delete', '/api/resources/objects/store?query=' + JSON.stringify(query)).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
      });
    });
  });

});
