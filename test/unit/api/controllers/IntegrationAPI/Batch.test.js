'use strict';

let should = require('chai').should();
let helpers = require(__basedir + '/helpers');


describe('IntegrationAPI BatchController Test', () => {

  after(() => helpers.clearAllTables());

  describe("#create", () => {

    describe('make batch meta GET requests', () => {
      let concurency;

      before(() => {
        concurency = sails.config.integrationapi.batchRequestConcurency;
        sails.config.integrationapi.batchRequestConcurency = 3;
      });

      after(() => {
        sails.config.integrationapi.batchRequestConcurency = concurency;
      });

      it('should return list of responses(request > 10)', () => {
        let reqData = [
          {
            "method": "GET",
            "relative_url": "api/resources"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/User"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/Store"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/Unknown"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/UserStore"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/Product"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/ProductCategory"
          }, {
            "method": "GET",
            "relative_url": "api/fake"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/ProductCategory"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/User"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/Store"
          }, {
            "method": "GET",
            "relative_url": "api/resources/fake"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/Role"
          }, {
            "method": "GET",
            "relative_url": "api/resources/meta/RoleUser"
          }
        ];

        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
          res.body.should.have.property('responses');
          res.body.should.have.property('responses').which.is.an('array').and.have.lengthOf(reqData.length);
        });
      });

    });

    describe('make batch POST requests', () => {

      after(() => Store.destroy({where: {}}));

      it('should return list of responses for POST requests', () => {
        let reqData = [{
          "method": "POST",
          "relative_url": "api/resources/objects/Store",
          "body": {
            "id": "2b9769ab-172d-46e0-a208-f7d570352317",
            "SWCode": "a1",
            "legalName": "Store name01",
            "actualName": "Actual name01",
            "actualAddress": "addr",
            "legalAddress": "legal addr",
            "city": "city",
            "delay": 3,
            "latitude": 1123.43,
            "longitude": 2323.34
          }
        }, {
          "method": "POST",
          "relative_url": "api/resources/objects/Store",
          "body": {
            "id": "2b9769ab-172d-46e0-a208-1111",
            "SWCode": "a2",
            "legalName": "Store name02",
            "actualName": "Actual name02",
            "actualAddress": "addr",
            "legalAddress": "legal addr",
            "city": "city",
            "delay": 3,
            "latitude": 1123.43,
            "longitude": 2323.34
          }
        }];

        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
          res.body.should.have.property('responses');
          res.body.should.have.property('responses').which.is.an('array').and.have.lengthOf(reqData.length);

          res.body.responses[0].should.have.property('success', true);
          res.body.responses[1].should.have.property('success', true);

          return ResourceFactory.recover('Store');
        }).then(ResourceStore => ResourceStore.findAll())
          .then(stores => {
            should.exist(stores);
            stores.should.be.instanceof(Array).and.have.lengthOf(2);
          });
      });

    });


    describe('make batch PUT requests', () => {

      before(() => {
        return ResourceFactory.recover('Store').then(ResourceStore => {
          return ResourceStore.bulkCreate([
            {
              "id": "2b9769ab",
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
              "id": "11abo012",
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
              "id": "aba123",
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
          ]);
        });
      });

      after(() => Store.destroy({where: {}}));

      it('should update resources', () => {
        let reqData = [{
          "method": "PUT",
          "relative_url": "api/resources/objects/Store",
          "body": {
            "id": "2b9769ab",
            "SWCode": "newCode"
          }
        }, {
          "method": "PUT",
          "relative_url": "api/resources/objects/Store",
          "body": {
            "id": "11abo012",
            "legalName": "newLegalName",
            "actualName": "newActualName",
            "actualAddress": "newActualAddress"
          }
        }, {
          "method": "PUT",
          "relative_url": "api/resources/objects/Store",
          "body": {
            "id": "unknowId",
            "legalName": "newLegalName",
            "actualName": "newActualName",
            "actualAddress": "newActualAddress"
          }
        }];

        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
          res.body.should.have.property('responses');
          res.body.should.have.property('responses').which.is.an('array').and.have.lengthOf(reqData.length);

          res.body.responses[0].should.have.property('success', true);
          res.body.responses[1].should.have.property('success', true);
          res.body.responses[2].should.have.property('success', false);

          res.body.responses[2].should.have.property('errors').which.is.an('array').and.have.lengthOf(1);

          return ResourceFactory.recover('Store');
        }).then(ResourceStore => {
          return ResourceStore.findAll({
            where: Sequelize.or({"SWCode": "newCode"}, {"legalName": "newLegalName"})
          });
        }).then(stores => {
          should.exist(stores);
          stores.should.be.instanceof(Array).and.have.lengthOf(2);
        });

      });

    });


    describe('make batch DELETE requests', () => {

      before(() => {
        return ResourceFactory.recover('Store').then(ResourceStore => {
          return ResourceStore.bulkCreate([
            {
              "id": "delete123-1",
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
              "id": "delete123-2",
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
              "id": "delete123-3",
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
          ]);
        });
      });

      after(() => Store.destroy({where: {}}));

      it('should delete resources', () => {
        let reqData = [{
          "method": "DELETE",
          "relative_url": "api/resources/objects/Store/delete123-2"
        }, {
          "method": "DELETE",
          "relative_url": "api/resources/objects/Store/delete123-1"
        }, {
          "method": "DELETE",
          "relative_url": "api/resources/objects/Store/delete123-3"
        }, {
          "method": "DELETE",
          "relative_url": "api/resources/objects/Store/unknowId"
        }];

        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(0);
          res.body.should.have.property('responses');
          res.body.should.have.property('responses').which.is.an('array').and.have.lengthOf(reqData.length);

          res.body.responses[0].should.have.property('success', true);
          res.body.responses[1].should.have.property('success', true);
          res.body.responses[2].should.have.property('success', true);

          return ResourceFactory.recover('Store');
        }).then(ResourceStore => {
          return ResourceStore.findAll({
            where: {}
          });
        }).then(stores => {
          should.exist(stores);
          stores.should.be.instanceof(Array).and.have.lengthOf(0);
        });

      });

    });


    describe('handle request errors', () => {

      it('should return error for not formed json', () => {

        let reqData = '["method": "POST", "relative_url": "api/resources/objects/Store", "body" : { "name": "testName", "isHandAccess": true, "isAdminAccess": false, "isSupervisorAccess": true,"isWriteAccess": false, id: 2  }]';

        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.status.should.be.eql(200);
          res.body.should.have.property('success', false);
          res.body.should.have.property('errors').which.is.an('array');
          res.body.errors.should.be.instanceof(Array).and.have.lengthOf(1);
        });
      });

    });


    describe('check limit requests', () => {
      let limitRequests;

      before(() => {
        limitRequests = sails.config.integrationapi.batchRequestLimit;
        sails.config.integrationapi.batchRequestLimit = 3;
      });

      after(() => {
        sails.config.integrationapi.batchRequestLimit = limitRequests;
      });

      it('should return error if limit is exceeded', () => {

        let reqData = [{
          "method": "GET",
          "relative_url": "api/resources"
        }, {
          "method": "GET",
          "relative_url": "api/resources/meta/User"
        }, {
          "method": "GET",
          "relative_url": "api/resources/meta/Store"
        }, {
          "method": "GET",
          "relative_url": "api/resources/meta/Unknown"
        }, {
          "method": "GET",
          "relative_url": "api/resources/meta/UserStore"
        }];


        return helpers.makeRequest('post', '/api/batch', reqData).then(res => {
          res.body.should.have.property('success', false);
          res.body.should.have.property('errors').which.is.an('array').and.have.lengthOf(1);
        });
      });

    });

  });
});
