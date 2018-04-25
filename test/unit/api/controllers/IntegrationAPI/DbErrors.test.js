'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');

let USER_ID = '2719859827',
  USER_ID2 = '11111111',
  STORE_ID = '2719859827',
  ORDER_ID = '2719859827',
  MANUFACTURER_ID = '1';

describe('IntegrationAPI database errors handle test', () => {

  after(() => helpers.clearAllTables());

  describe("foreign keys different resources", () => {

    before(() => {
      return Manufacturer.create({
        id: MANUFACTURER_ID,
        name: 'JDE'
      }).then(() => {
        return Store.create({
          "legalName": "legal name " + STORE_ID,
          "actualName": "actual name " + STORE_ID,
          "actualAddress": "actualAddress",
          "legalAddress": "legalAddress",
          "city": "City",
          "delay": 2,
          "latitude": 1223.43,
          "longitude": 2323.34,
          "id": STORE_ID,
          "SWCode": STORE_ID
        });
      }).then(() => {
        return User.create({
          id: USER_ID,
          firstName: 'first name ' + USER_ID,
          lastName: 'last name ' + USER_ID,
          middleName: 'middle_name ' + USER_ID,
          login: 'login test ' + USER_ID,
          phone: '380111111111',
          email: USER_ID + '@test.com'
        });
      }).then(() => {
        return Order.create({
          "totalSum": 2065.69,
          "orderCreationDate": "2016-05-01T09:49:49+02:00",
          "orderUpdateDate": "2016-05-01T09:49:49+02:00",
          "paymentDate": "2016-05-01T09:49:49+02:00",
          "orderTypeBack": false,
          "userId": USER_ID,
          "orderParentId": null,
          "storeId": STORE_ID,
          "id": ORDER_ID,
          "orderNumber": ORDER_ID,
          "contractNumber": "JDE5565",
          "manufacturerId": MANUFACTURER_ID
        });
      });
    });

    after(() => {
      return Promise.all([
        Order.destroy({where: {id: ORDER_ID}}),
        User.destroy({where: {id: USER_ID}}),
        Store.destroy({where: {id: STORE_ID}}),
        Manufacturer.destroy({where: {id: MANUFACTURER_ID}})
      ]);
    });

    it('should not tell about table name for Store', () => {
      return helpers.makeRequest('delete', '/api/resources/objects/Store/' + STORE_ID).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(1);

        let firstError = res.body.errors[0];

        firstError.should.match(/resource/i);
      });
    });
  });


  describe("foreign keys one resource", () => {

    before(() => {
      return User.create({
        id: USER_ID,
        firstName: 'first name ' + USER_ID,
        lastName: 'last name ' + USER_ID,
        middleName: 'middle_name ' + USER_ID,
        login: 'login test ' + USER_ID,
        phone: '380111111111',
        email: USER_ID + '@test.com'
      }).then(() => {
        return User.create({
          id: USER_ID2,
          parentId: USER_ID,
          firstName: 'first name ' + USER_ID2,
          lastName: 'last name ' + USER_ID2,
          middleName: 'middle_name ' + USER_ID2,
          login: 'login test ' + USER_ID2,
          phone: '380111111112',
          email: USER_ID2 + '@test.com'
        });
      }).then(() => {
        return UserParent.create({
          id: USER_ID2+USER_ID,
          parentId: USER_ID,
          userId: USER_ID2
        });
      });

    });

    it('should not tell about table name for User', () => {
      return helpers.makeRequest('delete', '/api/resources/objects/User/' + USER_ID).then(res => {
        res.body.should.have.property('success', false);
        res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(1);

        let firstError = res.body.errors[0];

        firstError.should.match(/resource/i);
      });
    });
  });
});
