'use strict';

const should = require('chai').should(),
  grunt = require('grunt'),
  helpers = require(__basedir + '/helpers'),
  Promise = require('bluebird');

describe('IntegrationAPI AsyncBatch Test', () => {

  let recordWithoutErrorsId,
    recordWithErrorsId;

  let reqData = {
    valid: [
      {
        "method": "POST",
        "relative_url": "api/resources/objects/Manufacturer",
        "body": {
          "name": "no_name_manufacturer"
        }
      },
      {
        "method": "POST",
        "relative_url": "api/resources/objects/Manufacturer",
        "body": {
          "name": "another_manufacturer"
        }
      }
    ],
    noValid: [
      {
        "method": "POST",
        "relative_url": "api/resources/fake",
        "body": {
          "name": "no_name_manufacturer_1"
        }
      },
      {
        "method": "POST",
        "relative_url": "api/resources/meta/Manufacturer",
        "body": {
          "name": "another_manufacturer_1"
        }
      }
    ]
  };

  after(() => helpers.clearAllTables());

  it('should create asyncBatchLog record (without errors) and return id of it', () => {
    return helpers.makeRequest('post', '/api/batch?async=true', reqData.valid).then(res => {
      res.body.should.have.property('success', true);
      res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
      res.body.should.have.property('responses');
      sails.log.info(res.body.responses);
      res.body.responses[0].should.have.property('requestId');
      recordWithoutErrorsId = res.body.responses[0].requestId;
    });
  });

  it('should create asyncBatchLog record (with errors) and return id of it', () => {
    return helpers.makeRequest('post', '/api/batch?async=true', reqData.noValid).then(res => {
      res.body.should.have.property('success', true);
      res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
      res.body.should.have.property('responses');
      sails.log.info(res.body.responses);
      res.body.responses[0].should.have.property('requestId');
      recordWithErrorsId = res.body.responses[0].requestId;
    });
  });

  it('should run asyncBatch grunt-task and check records status', () => {
    return Promise.map([recordWithoutErrorsId, recordWithErrorsId], recordId => {
      return new Promise(resolve => {
        grunt.tasks([`asyncBatch:${recordId}`], {}, () => resolve());
      });
    }, {concurrency: 1}).then(() => {
      return ApiAsyncBatchLog.findAll({
        where: {
          id: [recordWithoutErrorsId, recordWithErrorsId]
        }
      });
    }).then(response => {
      response.forEach(bachLogObject => {
        if (bachLogObject.dataValues.id === recordWithoutErrorsId) {
          bachLogObject.should.have.property('hasError', false);
        } else if (bachLogObject.dataValues.id === recordWithErrorsId) {
          bachLogObject.should.have.property('hasError', true);
        }

        bachLogObject.should.have.property('status', 'done');
      });
    });

  });

  it('should check created object in DB', () => {
    return Manufacturer.findAll().then(manufacturers => {
      manufacturers.forEach(manufacturer => {
        let checkManufacturer = reqData.valid.find(data => data.body.name === manufacturer.name);

        should.exist(checkManufacturer);
      });

      manufacturers.should.have.property('length', reqData.valid.length);
    });
  });

});
