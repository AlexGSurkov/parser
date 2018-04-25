'use strict';

const Promise = require('bluebird'),
  request = require('supertest'),
  AUTH_TOKEN = '123qwe',
  manufacturersFixtures = getFixtures('manufacturers'),
  gruntTasks = Promise.promisify(require('grunt').tasks),

  EXCLUDED_MODELS = [
    'GardenizeCustomer',
    'Customer',
    'CustomerAuthToken',
    'CustomerMeta',
    'CustomerResource',
    'CustomerResourceField'
  ].map(name => name.toLowerCase());

class Helper {
  /**
   *
   * "Before" methods
   *
   */

  static doMigrations() {
    return gruntTasks(['db:migration:up'], {});
  }

  static createAuthToken() {
    return GardenizeCustomer.findOne({
      where: {
        name: sails.config.resources.customer
      }
    }).then(customer => {
      if (!customer) {
        throw new Error("Customer not found");
      }

      return CustomerAuthToken.create({
        customerId: customer.id,
        token: AUTH_TOKEN
      });
    });
  }


  /**
   *
   * "After" methods
   *
   */

  static cleanDb() {
    return SequelizeConnections[sails.config.models.connection].getQueryInterface().dropAllTables();
  }

  static clearAllTables() {
    return SequelizeConnections[sails.config.models.connection].transaction(transaction => {
      return Promise.map(
        Object.keys(sails.models).filter(name => !EXCLUDED_MODELS.includes(name)),
        name => {
          return sails.models[name].destroy({truncate: true, cascade: true, transaction});
        },
        {concurrency: 10}
      );
    });
  }


  /**
   *
   * Request helper with auth token
   *
   */

  static makeRequest(type, url, data) {
    let r = request(sails.hooks.http.app);

    r = r[type](url).set('Authorization', 'Bearer ' + AUTH_TOKEN);
    data && (r = r.send(data));

    return r;
  }


  /**
   *
   * DB Helpers
   *
   */

  static createManufacturers(setCode) {
    let data = manufacturersFixtures;

    !setCode && (data = data.map(({id, name}) => ({id, name})));

    return Manufacturer.bulkCreate(data);
  }

  static createProductCategories(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true)]);
    }).then(() => {
      return ProductCategory.bulkCreate(getFixtures('product_categories'));
    });
  }

  static createProducts(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createProductCategories(true)]);
    }).then(() => {
      return Product.bulkCreate(getFixtures('products'));
    });
  }

  static createUsers() {
    return User.bulkCreate(getFixtures('users'));
  }

  static createStores() {
    return Store.bulkCreate(getFixtures('stores'));
  }

  static createOrders(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true), this.createUsers(), this.createStores()]);
    }).then(() => {
      return Order.bulkCreate(getFixtures('orders'));
    });
  }

  static createContracts(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true), this.createStores()]);
    }).then(() => {
      return Contract.bulkCreate(getFixtures('contracts'));
    });
  }

  static createUsersManufacturer(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true), this.createUsers()]);
    }).then(() => {
      return UserManufacturer.bulkCreate(getFixtures('users_manufacturer'));
    });
  }

  static createPriceTypes(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createContracts(true)]);
    }).then(() => {
      return PriceType.bulkCreate(getFixtures('price_types'));
    });
  }

  static createStoreGrades(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true)]);
    }).then(() => {
      return StoreGrade.bulkCreate(getFixtures('store_grades'));
    });
  }

  static createStoreTypes(deep) {
    return Promise.resolve().then(() => {
      return deep && Promise.all([this.createManufacturers(true)]);
    }).then(() => {
      return StoreType.bulkCreate(getFixtures('store_types'));
    });
  }

  static getFixtures(resourceName) {
    return getFixtures(resourceName);
  }
}

Helper.AUTH_TOKEN = AUTH_TOKEN;
Helper.MANUFACTURER_ID_JDE = manufacturersFixtures[0].id;
Helper.MANUFACTURER_ID_MNDLZ = manufacturersFixtures[1].id;
Helper.MANUFACTURER_JDE_CODE = manufacturersFixtures[0].code;
Helper.MANUFACTURER_MNDLZ_CODE = manufacturersFixtures[1].code;

module.exports = Helper;

function getFixtures(resourceName) {
  return require(`${__dirname}/fixtures/${resourceName}.json`);
}
