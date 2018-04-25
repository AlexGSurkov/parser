'use strict';

// define app's root dir
global.__basedir = __dirname;

const sailsMainInstance = require('sails'),
  pg = require('pg'),
  helpers = require(__basedir + '/helpers'),
  GAS = require(__basedir + '/../GAA/GAS/client'),
  should = require('chai').should(),
  sailsOptions = {
    // should be the same port as for integrationAPI in sails.config.microservices
    //
    // \test\service\IntegrationAPI\AsyncBatch.test.js runs grunt task asyncBatch,
    // it uses iAPI.buildRequestOptions -> ServiceRegistry.makeUrl -> getServer -> integrationAPI from sails.config.microservices
    // where port is set
    //
    // tests should use default port as set for integrationAPI microservice (or tests will falling)
    environment: 'test',
    migrating: false,
    hooks: {
      blueprints: false,
      orm: false,
      pubsub: false,
      grunt: false
    }
  };

before(() => {
  /**
   * Set data type parsers for sequelize
   */

  // for decimal
  pg.types.setTypeParser(1700, val => Number.parseFloat(val));

  return new Promise((resolve, reject) => {
    sailsMainInstance.lift(sailsOptions, err => {
      process.setMaxListeners(0);

      err ? reject(err) : resolve();
    });
  }).then(() => helpers.cleanDb())
    .then(() => helpers.doMigrations())
    .then(() => helpers.createAuthToken())
    .then(() => helpers.clearAllTables());
});

after(done => {
  helpers.cleanDb().then(() => {
    sailsMainInstance.lower(() => {
      done();
      process.exit();
    });
  }).catch(e => {
    sailsMainInstance.lower(() => {
      done(e);
      process.exit();
    });
  });
});


describe('GAS init', () => {
  it('should init GAS and check needed resources from API submodule', () => {
    return GAS.init(GAA.getGASInitOptions()).then(GASSubmodulesInitResponses => {
      should.exist(GASSubmodulesInitResponses);
      GASSubmodulesInitResponses.should.be.an('array');

      let APISubmoduleResourceClasses = GASSubmodulesInitResponses[0];

      should.exist(APISubmoduleResourceClasses);
      APISubmoduleResourceClasses.should.be.an('object').and.have.property('User').and.be.a('function');
      APISubmoduleResourceClasses.should.have.property('Product').and.be.a('function');

      return CustomerResource.count().then(resourcesCountFromDb => {
        Object.keys(APISubmoduleResourceClasses).should.have.length(resourcesCountFromDb);
      });
    });
  });
});
