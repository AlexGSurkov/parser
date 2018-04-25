'use strict';

const helpers = require(__basedir + '/helpers'),
  _ = require('lodash'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const should = chai.should();  // eslint-disable-line no-unused-vars

describe('AppRegistryService test', () => {

  before(() => {
    return Promise.all([
      User.bulkCreate(helpers.getFixtures('users')),
      Store.bulkCreate(helpers.getFixtures('stores')),
      AppRegistry.bulkCreate(helpers.getFixtures('app_registry'))
    ]).then(() => Promise.all([
      UserParent.bulkCreate(helpers.getFixtures('user_users')),
      UserStore.bulkCreate(helpers.getFixtures('user_stores')),
      AppRegistryUser.bulkCreate(helpers.getFixtures('app_registry_users')),
      AppRegistryStore.bulkCreate(helpers.getFixtures('app_registry_stores'))
    ])).then(() => Promise.all([
      User.update({scope: ['JDE']}, {where: {id: ['2', '4']}}),
      Store.update({scope: ['JDE']}, {where: {id: ['1', '2']}})
    ])).catch(e => {
      console.error(e);
      throw e;
    });
  });

  after(() => helpers.clearAllTables());

  describe('#findItemByFilter test', () => {
    it('should find item by filter', () => {
      return AppRegistryService.findItemByFilter({where: {id: '1'}}).then(app => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '1');
      });
    });

    it('should throw error if app not found', () => {
      return AppRegistryService.findItemByFilter({where: {id: '-1'}}).should.eventually.be.rejected;
    });

    it('should throw error if filter is not an object', () => {
      return AppRegistryService.findItemByFilter('-1').should.eventually.be.rejected;
    });

    it('should include new user stores if "addNewStores" setting is enabled', () => {
      return AppRegistryService.findItemByFilter({
        where: {id: '1'},
        include: {
          model: 'AppRegistryStore',
          as: 'appStores',
          attributes: [['storeId', 'itemId']]
        }
      }).then(app => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '1');
        app.appStores.should.be.an('array').and.have.lengthOf(2);
      });
    });

    it('should not include new user stores if "addNewStores" setting is disabled', () => {
      return AppRegistryService.findItemByFilter({
        where: {id: '2'},
        include: {
          model: 'AppRegistryStore',
          as: 'appStores',
          attributes: [['storeId', 'itemId']]
        }
      }).then(app => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '2');
        app.appStores.should.be.an('array').and.have.lengthOf(1);
      });
    });

    it('should include user stores if "sails.config.GAA.apps.addNewStores" includes app code', () => {
      return AppRegistryService.findItemByFilter({
        where: {id: '3'},
        include: {
          model: 'AppRegistryStore',
          as: 'appStores',
          attributes: [['storeId', 'itemId']]
        }
      }).then(app => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '3');
        app.appStores.should.be.an('array').and.have.lengthOf(2);
      });
    });
  });


  describe('#findItemsByFilter test', () => {
    it('should find items by filter', () => {
      return AppRegistryService.findItemsByFilter({
        where: {type: 'KPI'},
        attributes: ['type']
      }).then(apps => {
        apps.should.be.ok;
        apps.should.be.an('array').and.have.lengthOf(3);
        apps[0].should.be.an('object');
        _.cloneDeep(apps[0]).should.deep.equal(apps[0]);
        apps.forEach(app => app.should.have.property('type', 'KPI'));
      });
    });

    it('should return an empty array if apps not found', () => {
      return AppRegistryService.findItemsByFilter({where: {type: '-1'}}).then(apps => {
        apps.should.be.ok;
        apps.should.be.an('array').and.have.lengthOf(0);
      });
    });

    it('should throw error if filter is not an object', () => {
      return AppRegistryService.findItemsByFilter('-1').should.eventually.be.rejected;
    });

    it('should include new user stores if "addNewStores" setting is enabled', () => {
      return AppRegistryService.findItemsByFilter({
        where: {id: '1'},
        include: {
          model: 'AppRegistryStore',
          as: 'appStores',
          attributes: [['storeId', 'itemId']]
        }
      }).then(([app]) => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '1');
        app.appStores.should.be.an('array').and.have.lengthOf(2);
      });
    });

    it('should not include new user stores if "addNewStores" setting is disabled', () => {
      return AppRegistryService.findItemsByFilter({
        where: {id: '2'},
        include: {
          model: 'AppRegistryStore',
          as: 'appStores',
          attributes: [['storeId', 'itemId']]
        }
      }).then(([app]) => {
        app.should.be.ok;
        app.should.be.an('object');
        _.cloneDeep(app).should.deep.equal(app);
        app.should.have.property('id', '2');
        app.appStores.should.be.an('array').and.have.lengthOf(1);
      });
    });
  });


  describe('#findApps test', () => {
    it('should find apps by "ids" param', () => {
      return AppRegistryService.findApps({ids: ['1', '2']}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(2);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2']);
        true.should.not.have.property('appUsers');
        true.should.not.have.property('appStores');
      });
    });

    it('should find apps by "startDate" param', () => {
      return AppRegistryService.findApps({startDate: new Date(2016, 1, 1).toISOString()}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(4);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2', '3', '4']);
      });
    });

    it('should find apps by "finishDate" param', () => {
      return AppRegistryService.findApps({finishDate: new Date(3000, 1, 1).toISOString()}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(4);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2', '3', '4']);
      });
    });

    it('should find apps by "appType" param', () => {
      return AppRegistryService.findApps({appType: 'KPI'}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(3);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2', '3']);
      });
    });

    it('should find apps by "scopes" param', () => {
      return AppRegistryService.findApps({scopes: ['JDE', 'MNDLZ']}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(3);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2', '4']);
      });
    });

    it('should find apps by "code" param', () => {
      return AppRegistryService.findApps({code: ['volume_of_sales', 'debitor_gathering']}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(2);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['1', '2']);
      });
    });

    it('should find apps by "parentMetricId" param', () => {
      return AppRegistryService.findApps({parentMetricId: '-1'}).then(apps => {
        apps.should.be.an('array').and.have.lengthOf(1);
        _.sortBy(apps.map(({id}) => id)).should.deep.equal(['4']);
      });
    });

    it('should include stores if params object have "includeStores" key', () => {
      return AppRegistryService.findApps({
        ids: '2',
        includeStores: true
      }).then(([app]) => {
        app.should.be.ok;
        app.should.be.an('object');
        app.appStores.should.be.an('array').and.have.lengthOf(1);
        app.should.not.have.property('appUsers');
      });
    });

    it('should include users if params object have "includeUsers" key', () => {
      return AppRegistryService.findApps({
        ids: '2',
        includeUsers: true
      }).then(([app]) => {
        app.should.be.ok;
        app.should.be.an('object');
        app.appUsers.should.be.an('array').and.have.lengthOf(2);
        app.should.not.have.property('appStores');
      });
    });

    it('should return apps with needed attributes', () => {
      return AppRegistryService.findApps({
        ids: '2',
        attributes: ['id', 'code']
      }).then(([app]) => {
        app.should.be.ok;
        app.should.be.an('object');
        _.sortBy(Object.keys(app)).should.deep.equal(['code', 'id']);
      });
    });

    it('should order apps', () => {
      return AppRegistryService.findApps({
        attributes: ['id'],
        order: ['id', 'DESC']
      }).then(apps => {
        apps.should.be.ok;
        apps.should.be.an('array').and.have.lengthOf(4);
        apps.map(({id}) => id).should.deep.equal(['4', '3', '2', '1']);
      });
    });
  });


  describe('#getAppStoresPlanById test', () => {
    it('should return store data with plan', () => {
      return AppRegistryService.getAppStoresPlanById('2').then(storesData => {
        storesData = _.sortBy(storesData, 'id');

        storesData.should.have.lengthOf(1);
        _.sortBy(Object.keys(storesData[0])).should.be.deep.equal([
          'SWCode',
          'active',
          'actualAddress',
          'actualName',
          'addressLine1',
          'addressLine2',
          'building',
          'code',
          'country',
          'createdAt',
          'customerId',
          'delay',
          'district',
          'flat',
          'housing',
          'id',
          'kiosk',
          'landmark',
          'latitude',
          'legalAddress',
          'legalName',
          'longitude',
          'nfcNumber',
          'pavillion',
          'place',
          'plan',
          'region',
          'scope',
          'settlement',
          'settlementType',
          'shortName',
          'smartFilters',
          'updatedAt'
        ]);
        storesData[0].id.should.be.equal('1');
        storesData[0].plan.should.be.equal(300);
      });
    });

    it('should throw error if wrong id is supplied', () => {
      return AppRegistryService.getAppStoresPlanById('-1').should.eventually.be.rejected;
    });
  });

});
