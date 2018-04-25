'use strict';

let should = require('chai').should(),
  helpers = require(__basedir + '/helpers');


describe('IntegrationAPI ObjectsController Test with scopes', () => {

  after(() => helpers.clearAllTables());

  const JDE_SCOPE = 'JDE',
    MNDLZ_SCOPE = 'MNDLZ',
    UNKNOWN_SCOPE = 'unknown_scope';

  let storesData = [
    {
      "legalName": "ООО \"Дары востока\" 1",
      "actualName": "ООО \"Дары востока\" 1",
      "actualAddress": "пр-т Кирова, 64",
      "legalAddress": "пр-т Кирова, 64",
      "city": "Одесса",
      "delay": 2,
      "latitude": 1223.43,
      "longitude": 2323.34,
      "SWCode": "qw1",
      "scope": [JDE_SCOPE]
    },
    {
      "legalName": "ООО \"Дары востока\" 2",
      "actualName": "ООО \"Дары востока\" 2",
      "actualAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
      "legalAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
      "city": "Одесса",
      "delay": 3,
      "latitude": 1123.43,
      "longitude": 2323.34,
      "SWCode": "qw2",
      "scope": [MNDLZ_SCOPE]
    },
    {
      "legalName": "ООО \"Дары востока\" 3",
      "actualName": "ООО \"Дары востока\" 3",
      "actualAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
      "legalAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
      "city": "Одесса",
      "delay": 5,
      "latitude": 11234.43,
      "longitude": 21123.34,
      "SWCode": "qw3",
      "scope": [JDE_SCOPE, MNDLZ_SCOPE]
    },
    {
      "legalName": "ООО \"Дары востока\" 4",
      "actualName": "ООО \"Дары востока\" 4",
      "actualAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\") 4",
      "legalAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\") 4",
      "city": "Одесса",
      "delay": 5,
      "latitude": 11234.43,
      "longitude": 21123.34,
      "SWCode": "qw3",
      "scope": [MNDLZ_SCOPE, JDE_SCOPE]
    },
    {
      "legalName": "ООО \"Дары востока\" 5",
      "actualName": "ООО \"Дары востока\" 5",
      "actualAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\") 5",
      "legalAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\") 5",
      "city": "Одесса",
      "delay": 5,
      "latitude": 11234.43,
      "longitude": 21123.34,
      "SWCode": "qw3"
      // "scope": [MNDLZ_SCOPE, JDE_SCOPE]
    }
  ], scopeTestTable = [
    {
      scope: JDE_SCOPE,
      count: 3
    },
    {
      scope: MNDLZ_SCOPE,
      count: 3
    },
    {
      scope: [JDE_SCOPE],
      count: 3
    },
    {
      scope: [MNDLZ_SCOPE],
      count: 3
    },
    {
      scope: [JDE_SCOPE, MNDLZ_SCOPE],
      count: 4
    },
    {
      scope: [MNDLZ_SCOPE, JDE_SCOPE],
      count: 4
    },
    {
      scope: [UNKNOWN_SCOPE],
      count: 0
    },
    {
      scope: [JDE_SCOPE, UNKNOWN_SCOPE],
      count: 3
    },
    {
      scope: [MNDLZ_SCOPE, UNKNOWN_SCOPE],
      count: 3
    },
    {
      scope: [JDE_SCOPE, MNDLZ_SCOPE, UNKNOWN_SCOPE],
      count: 4
    },
    {
      scope: [UNKNOWN_SCOPE, MNDLZ_SCOPE, JDE_SCOPE],
      count: 4
    },
    {
      scope: null,
      count: 5
    },
    {
      scope: '',
      count: 5
    },
    {
      scope: undefined,
      count: 5
    },
    {
      scope: false,
      count: 5
    },
    {
      scope: 0,
      count: 5
    }
  ];


  describe("#POST", () => {


    describe('should create stores', () => {
      storesData.forEach((storeData, idx) => {
        it(`should create store #${idx}`, () => {
          return helpers.makeRequest('post', '/api/resources/objects/store', storeData).then(res => {
            res.body.should.have.property('success', true);
            res.body.should.have.property('errors').which.is.an('array').and.have.length(0);
          });
        });
      });
    });


    describe('should find all previously created stores', () => {
      it('find all stores', () => {
        return Store.findAll().then(stores => {
          should.exist(stores);
          stores.should.be.instanceof(Array).and.have.length(storesData.length);
        });
      });
    });

  });


  describe("#GET", () => {
    scopeTestTable.forEach(scopeTest => {
      it(`should return for "${scopeTest.scope}" scope(s) "${scopeTest.count}" store items`, () => {
        let query = encodeURIComponent(JSON.stringify({
          scope: scopeTest.scope
        }));

        return helpers.makeRequest('get', `/api/resources/objects/store?query=${query}`).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.length(0);
          res.body.should.have.property('store').which.is.an('array').and.have.length(scopeTest.count);
        });
      });
    });
  });


  describe("#Count", () => {
    scopeTestTable.forEach(scopeTest => {
      it(`should return for "${scopeTest.scope}" scope(s) stores count "${scopeTest.count}" `, () => {
        let query = encodeURIComponent(JSON.stringify({
          scope: scopeTest.scope
        }));

        return helpers.makeRequest('get', `/api/resources/objects/store/count?query=${query}`).then(res => {
          res.body.should.have.property('success', true);
          res.body.should.have.property('errors').which.is.an('array').and.have.length(0);
          res.body.should.have.property('store').which.is.a('number').and.eql(scopeTest.count);
        });
      });
    });
  });

});
