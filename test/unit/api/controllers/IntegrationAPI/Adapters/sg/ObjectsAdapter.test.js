'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  KeyModifier = require(__basedir + '/../api/services/KeyModifier'),
  keyModifier = new KeyModifier('sg');

describe('SG IntegrationAPI ObjectsController Test', () => {

  after(() => helpers.clearAllTables());

  describe("#POST", () => {

    after(() => User.destroy({where: {}}));

    it('should create User', () => {

      const reqData = {
        id: 'qw12',
        firstName: 'first_name_002',
        lastName: 'last_name_002',
        middleName: 'middle_name_002',
        login: 'login_test002',
        phone: '380934682220',
        email: 'test002@test.com'
      };

      return helpers.makeRequest('post', '/sg/api/resources/objects/user', reqData).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
        res.body.should.have.property('user');
        res.body.user.should.have.property('id', keyModifier.encode(reqData.id));
      });
    });
  });


  describe("#POST createOrUpdate", () => {
    const userData = [{
      "firstName": "Гарденайз",
      "lastName": "Супервайзер",
      "login": "supervisor1",
      "password": "qwerty",
      "phone": "380000000000",
      "province": "Киевская обл.",
      "city": "Киев",
      "address": "ул. павла Тычины 1-в",
      "id": keyModifier.encode('134324')
    }, {
      "firstName": "Гарденайз",
      "lastName": "Супервайзер",
      "login": "supervisor2",
      "password": "qwerty",
      "phone": "380000000001",
      "province": "Киевская обл.",
      "city": "Киев",
      "address": "ул. павла Тычины 1-в",
      "id": keyModifier.encode('245678')
    }, {
      "firstName": "Гарденайз",
      "lastName": "Супервайзер",
      "login": "supervisor3",
      "password": "qwerty",
      "phone": "380000000002",
      "province": "Киевская обл.",
      "city": "Киев",
      "address": "ул. павла Тычины 1-в",
      "id": keyModifier.encode('3ew54376897')
    }];

    before(() => User.bulkCreate(userData));

    after(() => User.destroy({where: {}}));

    it('should create User', () => {
      const newObjId = "3ew543768970";

      return helpers.makeRequest('post', '/sg/api/resources/objects/User?createOrUpdate=true', {
        "firstName": "Гарденайз",
        "lastName": "Супервайзер",
        "login": "supervisor4",
        "password": "qwerty",
        "phone": 380000000004,
        "province": "Киевская обл.",
        "city": "Киев",
        "address": "ул. павла Тычины 1-в",
        "id": newObjId
      }).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return User.findOne({
          where: {
            id: keyModifier.encode(newObjId)
          }
        });
      }).then(user => {
        should.exist(user);
      });
    });

    it('should update User', () => {
      return helpers.makeRequest('post', '/sg/api/resources/objects/User?createOrUpdate=true', {
        "firstName": "Гарденайз",
        "lastName": "Супервайзер",
        "login": "supervisor3",
        "password": "qwerty",
        "phone": "380000000024",
        "province": "Киевская обл.",
        "city": "Киев",
        "address": "ул. павла Тычины 1-в",
        "id": keyModifier.decode(userData[2].id)
      }).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return User.findOne({
          where: {
            id: userData[2].id
          }
        });
      }).then(user => {
        should.exist(user);
        should.exist(user.phone);
        user.phone.should.be.eql('380000000024');
      });
    });

    it('should update User by keys', () => {
      return helpers.makeRequest('post', '/sg/api/resources/objects/User?createOrUpdate=true&keys=phone,login', {
        "firstName": "Гарденайз",
        "lastName": "Супервайзер",
        "login": "supervisor1",
        "phone": "380000000000",
        "province": "Kiev",
        "city": "Киев",
        "address": "ул. павла Тычины 1-в"
      }).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

        return User.findOne({
          where: {
            id: userData[0].id
          }
        });
      }).then(user => {
        should.exist(user);
        should.exist(user.city);
        user.province.should.be.eql('Kiev');
      });
    });

    it('should create User by keys', () => {
      return helpers.makeRequest('post', '/sg/api/resources/objects/User?createOrUpdate=true&keys=phone,city',
        {
          "firstName": "Гарденайз",
          "lastName": "Супервайзер",
          "login": "supervisor10",
          "phone": "380000000010",
          "province": "Kiev",
          "city": "Киев",
          "address": "ул. павла Тычины 1-в"
        }).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);

          return User.count();
        }).then(userCount => {
          console.info("UserCount: ", userCount);

          should.exist(userCount);
          userCount.should.be.equal(5);
        });
    });


  });


  describe("#PUT", () => {

    const STORE_ID = 'qw12';

    before(() => {
      return Store.create({
        "id": keyModifier.encode(STORE_ID),
        "SWCode": "aaa1",
        "legalName": "legal name01",
        "actualName": "Actual name01",
        "actualAddress": "addr 01",
        "legalAddress": "legal addr",
        "city": "city",
        "delay": 3,
        "latitude": 1123.43,
        "longitude": 2323.34
      });
    });

    after(() => Store.destroy({where: {}}));

    it('should update Store', () => {

      const reqData = {
        legalName: 'newName',
        actualName: 'newActualName'
      };

      return helpers.makeRequest('put', '/sg/api/resources/objects/Store/' + STORE_ID, reqData).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
      });
    });

  });


  describe("#Count", () => {

    const storeList = [
      {
        "id": keyModifier.encode('2b9769ab'),
        "SWCode": "aaa1",
        "legalName": "legal name01",
        "actualName": "Actual name01",
        "actualAddress": "addr 01",
        "legalAddress": "legal addr",
        "city": "city",
        "delay": 3,
        "latitude": 1123.43,
        "longitude": 2323.34
      },
      {
        "id": keyModifier.encode('11abo012'),
        "SWCode": "aaa2",
        "legalName": "legal name02",
        "actualName": "Actual name02",
        "actualAddress": "addr 02",
        "legalAddress": "legal addr",
        "city": "city",
        "delay": 3,
        "latitude": 1123.43,
        "longitude": 2323.34
      },
      {
        "id": keyModifier.encode('aba123'),
        "SWCode": "aaa2",
        "legalName": "legal name02",
        "actualName": "Actual name02",
        "actualAddress": "addr 02",
        "legalAddress": "legal addr",
        "city": "city",
        "delay": 3,
        "latitude": 1123.43,
        "longitude": 2323.34
      }
    ];

    before(() => Store.bulkCreate(storeList));

    after(() => Store.destroy({where: {}}));

    it('should count Store', () => {

      return helpers.makeRequest('get', '/sg/api/resources/objects/Store/count').then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
        res.body.should.have.property('Store', storeList.length);
      });
    });

  });


  describe("#DELETE MASS", () => {

    const stores = [
      {
        "legalName": "ООО \"Дары востока\"",
        "actualName": "ООО \"Дары востока\"",
        "actualAddress": "пр-т Кирова, 64",
        "legalAddress": "пр-т Кирова, 64",
        "region": "Одесса",
        "delay": 2,
        "latitude": 1223.43,
        "longitude": 2323.34,
        "id": keyModifier.encode('1'),
        "SWCode": "qw1"
      },
      {
        "legalName": "ООО \"Дары востока\"",
        "actualName": "ООО \"Дары востока\"",
        "actualAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        "legalAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        "region": "Одесса",
        "delay": 3,
        "latitude": 1123.43,
        "longitude": 2323.34,
        "id": keyModifier.encode('2'),
        "SWCode": "qw2"
      },
      {
        "legalName": "ООО \"Дары востока\"",
        "actualName": "ООО \"Дары востока\"",
        "actualAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
        "legalAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
        "region": "Одесса",
        "delay": 5,
        "latitude": 11234.43,
        "longitude": 21123.34,
        "id": keyModifier.encode('3'),
        "SWCode": "qw3"
      },
      {
        "legalName": "ООО \"Дары востока\"",
        "actualName": "ООО \"Дары востока\"",
        "actualAddress": "пр-т Героев, (рынок \"Кодак\")",
        "legalAddress": "пр-т Героев, (рынок \"Кодак\")",
        "region": "Одесса",
        "delay": 10,
        "latitude": 11234.43,
        "longitude": 11123.34,
        "id": keyModifier.encode('4'),
        "SWCode": "qw4"
      }
    ];

    before(() => Store.bulkCreate(stores));

    after(() => Store.destroy({where: {}}));

    it('should delete by query', () => {

      const query = {id: ['1', '3']};

      return helpers.makeRequest('delete', '/sg/api/resources/objects/store?query=' + JSON.stringify(query)).then(res => {
        res.body.should.have.property('success', true);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(0);
        res.body.store.result.should.be.equal(query.id.length);

        return Store.findAll();
      }).then(result => {
        result.length.should.be.equal(stores.length - query.id.length);
      });
    });

    it('should not delete with empty query', () => {

      const query = {};

      return helpers.makeRequest('delete', '/sg/api/resources/objects/store?query=' + JSON.stringify(query)).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array');
        res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
      });
    });
  });

});
