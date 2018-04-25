'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers');

const SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND = '$overlap';


describe('ScopeService test', () => {
  describe('#Models with default scope test', () => {
    const data = {
      users: [
        {
          "firstName": "Артем",
          "lastName": "Муравьев",
          "middleName": "Константинович",
          "email": "mmorjik@bk.ru",
          "phone": 380634494123,
          "province": "Житомирская обл.",
          "city": "Житомир",
          "address": "ул. Богдана Хмельницкого",
          "id": "q18",
          "active": true
        },
        {
          "firstName": "Михаил",
          "lastName": "Шарабин",
          "middleName": "Романович",
          "email": "mogruslan1@rambler.ru",
          "phone": 380634494124,
          "province": "Житомирская обл.",
          "city": "Житомир",
          "address": "ул. Полевая",
          "id": "q19",
          "active": false
        },
        {
          "firstName": "Людмила",
          "lastName": "Шинкарева",
          "middleName": "Дмитриевна",
          "email": "mmosin.vovchik@yandex.ru",
          "phone": 380634494125,
          "province": "Одесская обл.",
          "city": "Одесса",
          "address": "ул. Дерибасовская",
          "id": "q20",
          "active": true
        }
      ],
      stores: [
        {
          "legalName": "ООО \"Дары востока\"",
          "actualName": "ООО \"Дары востока\"",
          "actualAddress": "пр-т Кирова, 64",
          "legalAddress": "пр-т Кирова, 64",
          "city": "Одесса",
          "delay": 2,
          "latitude": 1223.43,
          "longitude": 2323.34,
          "id": "1",
          "SWCode": "qw1",
          "active": false
        },
        {
          "legalName": "ООО \"Дары востока\"",
          "actualName": "ООО \"Дары востока\"",
          "actualAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
          "legalAddress": "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
          "city": "Одесса",
          "delay": 3,
          "latitude": 1123.43,
          "longitude": 2323.34,
          "id": "2",
          "SWCode": "qw2"
        },
        {
          "legalName": "ООО \"Дары востока\"",
          "actualName": "ООО \"Дары востока\"",
          "actualAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
          "legalAddress": "ул. Ширшова (рынок возле ТЦ \"НОВЫЙ ЦЕНТР\")",
          "city": "Одесса",
          "delay": 5,
          "latitude": 11234.43,
          "longitude": 21123.34,
          "id": "3",
          "SWCode": "qw3"
        }
      ],
      userStore: [
        {
          "userId": "q18",
          "storeId": "1"
        },
        {
          "userId": "q19",
          "storeId": "2"
        },
        {
          "userId": "q20",
          "storeId": "3"
        }
      ]
    };

    before(() => {
      return User.bulkCreate(data.users, {returning: true})
        .then(() => Store.bulkCreate(data.stores, {returning: true}))
        .then(() => UserStore.bulkCreate(data.userStore, {returning: true}));
    });

    after(() => helpers.clearAllTables());

    it('should return Users where "active" = true', () => {
      return User.findAll({}).then(users => {
        users.forEach(user => {
          user.active.should.be.equal(true);
        });
      });
    });

    it('should return Users including stores where "active"=true', () => {
      return User.findAll({
        include: [
          {
            model: Store,
            as: 'stores'
          }
        ]
      }).then(users => {
        users.forEach(user => {
          user.active.should.be.equal(true);
          user.stores.forEach(store => {
            store.active.should.be.equal(true);
          });
        });
      });
    });

    it('should return all Users & Stores', () => {
      return User.unscoped().findAll({
        include: [
          {
            model: Store.unscoped(),
            as: 'stores'
          }
        ]
      }).then(users => {
        users.length.should.be.equal(data.users.length);
        users.forEach(user => {
          user.stores.length.should.be.above(0);
        });
      });
    });

  });


  describe('#scopeAutoReplace method test', () => {

    it('should return JDE - Якобз производитель', () => {
      let code = ScopeService.scopeAutoReplace('Якобз производитель');

      code.should.eql('JDE');
    });

    it('should return MNDLZ - Монделиз', () => {
      let code = ScopeService.scopeAutoReplace('Монделиз');

      code.should.eql('MNDLZ');
    });

    it('should return MNDLZ - Монделіс Україна ПрАТ', () => {
      let code = ScopeService.scopeAutoReplace('Монделіс Україна ПрАТ');

      code.should.eql('MNDLZ');
    });

    it('should return JDE - Якобз Україна ПрАТ', () => {
      let code = ScopeService.scopeAutoReplace('Якобз Україна ПрАТ');

      code.should.eql('JDE');
    });

    it('should return CHUMAK - Чумак ПрАТ', () => {
      let code = ScopeService.scopeAutoReplace('Чумак ПрАТ');

      code.should.eql('CHUMAK');
    });

  });


  describe('#query method test', () => {
    const scopes = ['JDE', 'Mondelez'],
      userData = [
        {
          firstName: 'Игорь',
          lastName: 'Дибров',
          login: 'Igor',
          city: 'Киев',
          address: 'Бульвар БВС',
          id: '1211',
          phone: '380500874422',
          scope: ['JDE']
        },
        {
          firstName: 'Иван',
          lastName: 'Плов',
          login: 'Ivan',
          city: 'Киев',
          address: 'Бульвар БВС',
          id: '1213',
          phone: '380500874423',
          scope: ['Mondelez']
        },
        {
          firstName: 'Антон',
          lastName: 'Светлов',
          login: 'Anton',
          city: 'Киев',
          address: 'Бульвар БВС',
          id: '1214',
          phone: '380500874424',
          scope: ['Mondelez', 'JDE']
        }
      ];

    before(() => User.bulkCreate(userData, {returning: true}));

    after(() => helpers.clearAllTables());

    scopes.forEach(scope => {
      it('should get all users with ' + scope + ' scope', () => {
        return User.findAll({
          where: ScopeService.query(scope)
        }).then(users => {
          should.exist(users);
          users.forEach(user => {
            let haveScope = user.scope.find(userScope => userScope === scope);

            haveScope.should.be.a('string');
          });
        });
      });
    });

    it('should return users with ' + scopes.join('&') + ' scope', () => {
      return User.findAll({
        where: ScopeService.query(scopes)
      }).then(users => {
        should.exist(users);
        users.length.should.be.equal(userData.length);
      });
    });

    it('should return users with ' + scopes.join('&') + ' scope and merge with "where" query', () => {
      return User.findAll({
        where: ScopeService.query(scopes, {
          city: 'Киев',
          phone: {
            $or: ['380500874423', '380500874424']
          }
        })
      }).then(users => {
        should.exist(users);
        users.length.should.be.equal(2);
      });
    });

  });


  describe('#filter method test', () => {


    describe('#Check wrong tests', () => {

      it('Some object that is NOT a filter', () => {
        (ScopeService.filter({scope: 'JDE'}).scope === 'JDE').should.be.true;
      });

      it('Some empty object', () => {
        ScopeService.filter({}).should.be.an('object').and.is.empty;
      });

      it('Without any params', () => {
        ScopeService.filter().should.be.an('object').and.is.empty;
      });

      it('With null as param', () => {
        should.equal(ScopeService.filter(null), null);
      });

      it('With booleans as param', () => {
        ScopeService.filter(false).should.be.false;
        ScopeService.filter(true).should.be.true;
      });

      it('With string as param', () => {
        ScopeService.filter('').should.be.a('string').and.has.length(0);
      });

    });


    describe('#Without sub-includes', () => {

      it('where', () => {
        const {where: {scope}} = ScopeService.filter({
          where: {scope: ['JDE', 'MNDLZ']}
        });

        scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['JDE', 'MNDLZ']);
      });

    });


    describe('#With includes', () => {

      it('where + include without where', () => {
        const response = ScopeService.filter({
          where: {scope: ['MNDLZ']},
          include: {}
        });

        response.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['MNDLZ']);
        response.include.should.be.an('object').and.is.empty;
      });

      it('where + include with where without scope', () => {
        const response = ScopeService.filter({
          where: {scope: 'MNDLZ'},
          include: [{where: {}}]
        });

        response.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['MNDLZ']);
        response.include[0].where.should.be.an('object').and.is.empty;
      });

      it('where + include with where with scope', () => {
        const response = ScopeService.filter({
          where: {scope: 'MNDLZ'},
          include: {where: {scope: ['JDE', 'MNDLZ']}}
        });

        response.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['MNDLZ']);
        response.include.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['JDE', 'MNDLZ']);
      });

      it('without where + include without where + include without where', () => {
        const {include: [{include}]} = ScopeService.filter({
          include: [{include: {}}]
        });

        include.should.be.an('object').and.is.empty;
      });

      it('without where + include without where + include with where', () => {
        const {include: [{include: {where: {scope}}}]} = ScopeService.filter({
          include: [{include: {where: {scope: ['JDE', 'MNDLZ']}}}]
        });

        scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['JDE', 'MNDLZ']);
      });

      it('where + include with where + include with where + include with where', () => {
        const response = ScopeService.filter({
          where: {scope: 'MNDLZ'},
          include: [
            {
              where: {scope: ['JDE']},
              include: {
                where: {scope: ['JDE', 'MNDLZ']},
                include: [
                  {
                    where: {scope: ['TEST1', 'TEST2']}
                  }
                ]
              }
            }
          ]
        });

        response.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['MNDLZ']);
        response.include[0].where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['JDE']);
        response.include[0].include.where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['JDE', 'MNDLZ']);
        response.include[0].include.include[0].where.scope.should.has.property(SCOPE_SERVICE_ARRAY_INTERSECTION_OPERAND).which.is.an('array').and.deep.equal(['TEST1', 'TEST2']);
      });

    });

  });

});

