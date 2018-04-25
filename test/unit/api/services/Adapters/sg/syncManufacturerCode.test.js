'use strict';

const should = require('chai').should(),
  helpers = require(__basedir + '/helpers'),
  MANUFACTURER_ID_1 = '1',
  MANUFACTURER_ID_2 = '2',
  MANUFACTURER_CODE_1 = 'JDE',
  MANUFACTURER_CODE_2 = 'MNDLZ';

let syncAdapter;

describe('SG syncManufacturerCode service test', () => {
  before(() => helpers.createManufacturers().then(() => {
    syncAdapter = new SGAdapterService.SyncManufacturerCode();
  }));

  after(() => helpers.clearAllTables());

  it('should sync manufacturers code (first time)', () => {
    return Manufacturer.findOne({where: {id: MANUFACTURER_ID_1}}).then(manufacturer => {
      should.exist(manufacturer);
      should.equal(manufacturer.code, null);

      return syncAdapter.sync(MANUFACTURER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Manufacturer.findOne({where: {id: MANUFACTURER_ID_1}});
    }).then(manufacturer => {
      should.exist(manufacturer);
      should.exist(manufacturer.code);
      manufacturer.code.should.be.eql(MANUFACTURER_CODE_1);
    });
  });

  it('should sync manufacturers code (second time) after caching', () => {
    return Manufacturer.findOne({where: {id: MANUFACTURER_ID_2}}).then(manufacturer => {
      should.exist(manufacturer);
      should.equal(manufacturer.code, null);

      return syncAdapter.sync(MANUFACTURER_ID_2, helpers.AUTH_TOKEN);
    }).then(() => {
      return Manufacturer.findOne({where: {id: MANUFACTURER_ID_2}});
    }).then(manufacturer => {
      should.exist(manufacturer);
      should.exist(manufacturer.code);
      manufacturer.code.should.be.eql(MANUFACTURER_CODE_2);
    });
  });

  it('should sync manufacturers code after name change', () => {
    return Manufacturer.update({name: 'Чумак'}, {where: {id: '1'}}).then(() => {
      return syncAdapter.sync(MANUFACTURER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Manufacturer.findOne({where: {id: MANUFACTURER_ID_1}});
    }).then(manufacturer => {
      should.exist(manufacturer);
      should.exist(manufacturer.code);
      manufacturer.code.should.be.eql('CHUMAK');
    });
  });

  it('should not sync manufacturers code if name is not included in scopesMatchList', () => {
    return Manufacturer.update({name: 'ZONE 1', code: 'ZONE 1'}, {where: {id: '1'}}).then(() => {
      return syncAdapter.sync(MANUFACTURER_ID_1, helpers.AUTH_TOKEN);
    }).then(() => {
      return Manufacturer.findOne({where: {id: MANUFACTURER_ID_1}});
    }).then(manufacturer => {
      should.exist(manufacturer);
      should.exist(manufacturer.code);
      manufacturer.code.should.be.eql('ZONE 1');
    });
  });
});
