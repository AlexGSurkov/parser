'use strict';

const helpers = require(__basedir + '/helpers'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const should = chai.should();  // eslint-disable-line no-unused-vars

/**
 * Hierarchy Service unit tests
 */
describe('hierarchyHelper test', () => {

  after(() => helpers.clearAllTables());

  describe('#hierarchy levels', () => {

    let users = [
      {
        firstName: 'Антон',
        lastName: 'Яшин',
        login: 'anya',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '12',
        phone: '380669898485',
        scope: ['JDE']
      },
      {
        firstName: 'Влад',
        lastName: 'Копылаш',
        login: 'vkop',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '7',
        phone: '380934682120',
        scope: ['JDE']
      },
      {
        firstName: 'Аня',
        lastName: 'Ревакович',
        login: 'anre',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '10',
        phone: '380634494313',
        scope: ['JDE']
      },
      {
        firstName: 'Богдан',
        lastName: 'Корецкий',
        login: 'boko',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '14',
        phone: '380500874422',
        scope: ['JDE']
      },
      {
        firstName: 'Дима',
        lastName: 'Низовцев',
        login: 'dini',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '13',
        phone: '380500874423',
        scope: ['JDE']
      }
    ];

    before(() => {
      return User.bulkCreate(users).then(() => {
        return UserParent.bulkCreate(
          [
            {
              userId: users[1].id,
              parentId: users[0].id
            },
            {
              userId: users[2].id,
              parentId: users[0].id
            },
            {
              userId: users[3].id,
              parentId: users[0].id
            },
            {
              userId: users[4].id,
              parentId: users[1].id
            },
            {
              userId: users[4].id,
              parentId: users[2].id
            }
          ]
        );
      });

    });

    after(() => UserParent.destroy({where: {}}).then(() => User.destroy({where: {}})));

    it('should have 3 children', () => {
      return hierarchyHelper.getUserHierarchy({
        userId: users[0].id,
        scope: users[0].scope
      }).then(user => {
        user.should.be.ok;
        user.should.have.property('children').which.is.an('array');
        user.children.length.should.be.eql(3);
      });
    });

    it('should have 0 children', () => {
      return hierarchyHelper.getUserHierarchy({
        userId: users[3].id,
        scope: users[3].scope
      }).then(user => {
        user.should.be.ok;
        user.should.have.property('children').which.is.an('array');
        user.children.length.should.be.eql(0);
      });
    });

    it('should handle multiple hierarchy', () => {
      return hierarchyHelper.getUserHierarchy({
        userId: users[0].id,
        scope: users[0].scope
      }).then(user => {
        user.should.be.ok;

        let user1 = user.children[0];

        user1.should.have.property('children').which.is.an('array');
        user1.children.length.should.be.eql(1);

        let user2 = user.children[1];

        user2.should.have.property('children').which.is.an('array');
        user2.children.length.should.be.eql(1);

        (user1.children[0].id === user2.children[0].id).should.be.true;
      });
    });

    it('should not find user', () => {
      return hierarchyHelper.getUserHierarchy({
        userId: '568'
      }).should.eventually.be.rejected;
    });

  });


  describe('#Hierarchy with stores', () => {

    let users = [
      {
        firstName: 'Антон',
        lastName: 'Яшин',
        login: 'anya',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '12',
        phone: '380669898485',
        scope: ['JDE']
      },
      {
        firstName: 'Влад',
        lastName: 'Копылаш',
        login: 'vkop',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '7',
        phone: '380934682120',
        scope: ['JDE']
      },
      {
        firstName: 'Аня',
        lastName: 'Ревакович',
        login: 'anre',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '10',
        phone: '380634494313',
        scope: ['JDE']
      },
      {
        firstName: 'Богдан',
        lastName: 'Корецкий',
        login: 'boko',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '14',
        phone: '380500874422',
        scope: ['JDE']
      },
      {
        firstName: 'Дима',
        lastName: 'Низовцев',
        login: 'dini',
        city: 'Киев',
        address: 'Бульвар БВС',
        id: '13',
        phone: '380500874423',
        scope: ['JDE']
      }
    ];

    let stores = [
      {
        id: '1',
        SWCode: "qw1",
        legalName: "ООО \"Дары востока\"",
        actualName: "ООО \"Дары востока\"",
        actualAddress: "пр-т Кирова, 64",
        legalAddress: "пр-т Кирова, 64",
        city: "Одесса",
        delay: 2,
        latitude: 1223.43,
        longitude: 2323.34,
        scope: ['JDE']
      },
      {
        id: '2',
        SWCode: "qw2",
        legalName: "ООО \"Дары востока\"",
        actualName: "ООО \"Дары востока\"",
        actualAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        legalAddress: "Донецкое шоссе-ул. Березинская (р-н ТРЦ \"КАРАВАН\")",
        city: "Одесса",
        delay: 3,
        latitude: 1123.43,
        longitude: 2323.34,
        scope: ['JDE']
      }
    ];

    before(() => {
      return User.bulkCreate(users).then(() => {
        return UserParent.bulkCreate(
          [
            {
              userId: users[1].id,
              parentId: users[0].id
            },
            {
              userId: users[2].id,
              parentId: users[0].id
            },
            {
              userId: users[3].id,
              parentId: users[0].id
            },
            {
              userId: users[4].id,
              parentId: users[1].id
            },
            {
              userId: users[4].id,
              parentId: users[2].id
            }
          ]
        );
      }).then(() => {
        return Store.bulkCreate(stores);
      }).then(() => {
        return UserStore.bulkCreate(
          [
            {
              userId: users[4].id,
              storeId: stores[0].id
            },
            {
              userId: users[4].id,
              storeId: stores[1].id
            }
          ]
        );
      });

    });

    after(() => {
      return UserParent.destroy({where: {}})
        .then(() => UserStore.destroy({where: {}}))
        .then(() => Store.destroy({where: {}}))
        .then(() => User.destroy({where: {}}));
    });

    it('should have stores', () => {
      return hierarchyHelper.getUserHierarchy({
        userId: users[0].id,
        scope: users[0].scope,
        includeStores: true
      }).then(user => {
        user.should.be.ok;
        user.children[0].children[0].should.have.property('children').which.is.an('array');
        user.children[0].children[0].children.length.should.be.eql(2);
        user.children[0].children[0].children[0].dataValues.type.should.be.eql('store');
      });
    });


  });

});
