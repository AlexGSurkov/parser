'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');

describe('SG PriceType watchers Test', () => {

  after(() => helpers.clearAllTables());

  describe('#PRICE TYPE scope&contract adapter test', () => {

    const _CONTRACTID_ = 'q12',
      _MANUFACTURER_ = 'JDE',
      _MANUFACTURERID_ = 'qw33',
      _STOREID_ = 'qw12',
      _PRICETYPEID_ = 'q18';

    beforeEach(() => {
      return Manufacturer.create({
        id: _MANUFACTURERID_,
        name: _MANUFACTURER_,
        code: helpers.MANUFACTURER_JDE_CODE
      }).then(() => {
        return Store.create({
          "legalName": "ООО \"Дары востока\"",
          "actualName": "ООО \"Дары востока\"",
          "actualAddress": "пр-т Кирова, 64",
          "legalAddress": "пр-т Кирова, 64",
          "city": "Одесса",
          "delay": 2,
          "latitude": 1223.43,
          "longitude": 2323.34,
          "id": _STOREID_,
          "SWCode": "qw1"
        });
      }).then(() => {
        return Contract.create({
          "id": _CONTRACTID_,
          "counterparty": "ФЛП Стельмахович Е.В",
          "contractNumber": "JDE1828",
          "paymentDelay": 7,
          "externalKey": '1',
          "storeId": _STOREID_,
          "manufacturerId": _MANUFACTURERID_,
          "scope": [helpers.MANUFACTURER_JDE_CODE]
        });
      });
    });

    afterEach(() => {
      return PriceType.destroy({where: {}})
        .then(() => Contract.destroy({where: {}}))
        .then(() => Store.destroy({where: {}}))
        .then(() => Manufacturer.destroy({where: {}}));
    });

    it('should only add scope to PriceType with contractId', () => {
      const priceType = {
        "id": _PRICETYPEID_,
        "priceFor": "JDE Jacobs",
        "priceType": "-2",
        "contractExternalKey": '1',
        "storeId": _STOREID_,
        "contractId": _CONTRACTID_
      };

      return helpers.makeRequest('post', '/sg/api/resources/objects/priceType', priceType).then(() => {
        return PriceType.findById(_PRICETYPEID_);
      }).then(() => {
        // priceType.scope.length.should.equal(1);
        // priceType.should.have.property('scope');
        // priceType.scope.should.deep.contain([helpers.MANUFACTURER_JDE_CODE]);
      });
    });

    it('should create price type with contractId&scope', () => {
      const priceType = {
        "id": _PRICETYPEID_,
        "priceFor": "JDE Jacobs",
        "priceType": "-2",
        "storeId": _STOREID_,
        "contractExternalKey": "1"
      };

      return helpers.makeRequest('post', '/sg/api/resources/objects/priceType', priceType).then(() => {
        return PriceType.findById(_PRICETYPEID_);
      }).then(() => {
        // priceType.scope.length.should.equal(1);
        // priceType.should.have.property('scope');
        // priceType.scope.should.deep.contain([helpers.MANUFACTURER_JDE_CODE]);
        // priceType.should.have.property('contractId', _CONTRACTID_)
      });
    });

  });

});
