'use strict';

const should = require('chai').should(),
  _ = require('lodash');


describe('ServiceRegistry test', () => {
  describe('#getServer test', () => {
    let microservices;

    before(() => {
      microservices = _.cloneDeep(sails.config.microservices);

      sails.config.microservices = {
        microservicearray1: [
          {
            "server": "host.name1",
            "weight": 1
          },
          {
            "server": "host.name2",
            "weight": 3
          }
        ],
        microservicearray2: [
          {
            "server": "host.name1"
          },
          {
            "server": "host.name2"
          }
        ],
        microservicestring: "host.name"
      };
    });

    after(() => sails.config.microservices = microservices);

    it('should get server from string config', () => {
      let server = ServiceRegistry.getServer("microservicestring");

      should.exist(server);
      server.should.be.eql("host.name");
    });

    it('should get from array config', function () {
      let countServer1 = 0,
        countServer2 = 0;

      for (let i=0; i< 1000; i++) {
        let server = ServiceRegistry.getServer("microservicearray1");

        should.exist(server);
        server.should.be.oneOf(["host.name1", "host.name2"]);
        if (server === "host.name1") {
          countServer1++;
        }
        if (server === "host.name2") {
          countServer2++;
        }
      }

      countServer1.should.be.greaterThan(0);
      countServer2.should.be.greaterThan(0);
    });

    it('should get from array config without weight', function () {
      let countServer1 = 0,
        countServer2 = 0;

      for (let i=0; i< 1000; i++) {
        let server = ServiceRegistry.getServer("microservicearray2");

        should.exist(server);
        server.should.be.oneOf(["host.name1", "host.name2"]);
        if (server === "host.name1") {
          countServer1++;
        }
        if (server === "host.name2") {
          countServer2++;
        }
      }

      countServer1.should.be.greaterThan(0);
      countServer2.should.be.greaterThan(0);
    });

    it('should get from array config by weight', function () {
      let countServer1 = 0,
        countServer2 = 0;

      for (let i=0; i< 1000; i++) {
        let server = ServiceRegistry.getServer("microservicearray1");

        should.exist(server);
        server.should.be.oneOf(["host.name1", "host.name2"]);
        if (server === "host.name1") {
          countServer1++;
        }
        if (server === "host.name2") {
          countServer2++;
        }
      }

      countServer1.should.be.greaterThan(0);
      countServer2.should.be.greaterThan(0);
      countServer2.should.be.greaterThan(countServer1);
    });

  });


  describe('#makeUrl test', () => {
    let microservices;

    before(() => {
      microservices = _.cloneDeep(sails.config.microservices);

      sails.config.microservices = {
        microservice1: [
          {
            "server": "host.name1",
            "weight": 1
          }
        ],
        microservice2: [
          {
            "server": "host.name2"
          }
        ],
        microservice3: "host.name"
      };
    });

    after(() => sails.config.microservices = microservices);

    it('should makeUrl from string config', () => {
      ServiceRegistry.makeUrl("microservice1").should.be.eql('http://host.name1');
    });

    it('should makeUrl with options', () => {
      ServiceRegistry.makeUrl("microservice2", "", {protocol: 'https'}).should.be.eql('https://host.name2');
    });
  });

});

