'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers'),
  KeyModifier = require(__basedir + '/../api/services/KeyModifier'),
  keyModifier = new KeyModifier('sg');

describe('SG User watchers Test', () => {

  after(() => helpers.clearAllTables());

  describe("#USER scope adapter POST", () => {
    const USER_ID = keyModifier.encode('100');

    const manufacturers = [
      {
        "id": keyModifier.encode('1'),
        "name": "JDE",
        "code": helpers.MANUFACTURER_JDE_CODE
      },
      {
        "id": keyModifier.encode('2'),
        "name": "Mondelez",
        "code": helpers.MANUFACTURER_MNDLZ_CODE
      }
    ];

    before(() => {
      return User.create({
        id: USER_ID,
        firstName: 'Vlad',
        lastName: 'Kopylash',
        phone: '380934682120'
      }).then(() => Manufacturer.bulkCreate(manufacturers));
    });

    after(() => {
      return UserManufacturer.destroy({where: {}}).then(() => Promise.all([
        User.destroy({where: {}}),
        Manufacturer.destroy({where: {}})
      ]));
    });

    it('should connect user with Manufacturer JDE', () => {

      const userManufacturer = {
        userId: keyModifier.decode(USER_ID),
        manufacturerId: keyModifier.decode(manufacturers[0].id)
      };

      return helpers.makeRequest('post', '/sg/api/resources/objects/UserManufacturer', userManufacturer).then(() => {
        return User.findById(USER_ID);
      }).then(user => {
        user.should.have.property('scope');
        user.scope.should.deep.equal([helpers.MANUFACTURER_JDE_CODE]);
      });
    });

  });


  describe("#USER scope adapter DELETE by ID", () => {
    const USER_ID = keyModifier.encode('100');

    const manufacturers = [
      {
        "id": keyModifier.encode('1'),
        "name": "JDE",
        "code": helpers.MANUFACTURER_JDE_CODE
      },
      {
        "id": keyModifier.encode('2'),
        "name": "Mondelez",
        "code": helpers.MANUFACTURER_MNDLZ_CODE
      }
    ];

    const userManufacturers = [
      {
        id: '1',
        userId: USER_ID,
        manufacturerId: manufacturers[0].id
      },
      {
        id: '2',
        userId: USER_ID,
        manufacturerId: manufacturers[1].id
      }
    ];

    before(() => {
      return User.create({
        id: USER_ID,
        firstName: 'Vlad',
        lastName: 'Kopylash',
        phone: '380934682120',
        scope: [manufacturers[0].code, manufacturers[1].code]
      }).then(() => Manufacturer.bulkCreate(manufacturers))
        .then(() => UserManufacturer.bulkCreate(userManufacturers));
    });

    after(() => {
      return UserManufacturer.destroy({where: {}}).then(() => Promise.all([
        User.destroy({where: {}}),
        Manufacturer.destroy({where: {}})
      ]));
    });

    it('should delete relation of user with manufacturer JDE', () => {

      return helpers.makeRequest('delete', '/sg/api/resources/objects/UserManufacturer/' + userManufacturers[0].id).then(() => {
        return User.findById(USER_ID);
      }).then(user => {
        user.should.have.property('scope');
        user.scope.should.deep.equal([helpers.MANUFACTURER_MNDLZ_CODE]);
      });
    });

  });


  describe("#USER scope adapter MASS DELETE by query", () => {

    const manufacturers = [
      {
        "id": keyModifier.encode('1'),
        "name": "JDE",
        "code": helpers.MANUFACTURER_JDE_CODE
      },
      {
        "id": keyModifier.encode('2'),
        "name": "Mondelez",
        "code": helpers.MANUFACTURER_MNDLZ_CODE
      }
    ];

    const users = [
      {
        id: keyModifier.encode('100'),
        firstName: 'Vlad',
        lastName: 'Kopylash',
        phone: '380934682120',
        scope: [manufacturers[0].name, manufacturers[1].name]
      },
      {
        id: keyModifier.encode('200'),
        firstName: 'Antonio',
        lastName: 'Hopkins',
        phone: '380934682122',
        scope: [manufacturers[1].name]
      }
    ];

    const userManufacturers = [
      {
        id: '1',
        userId: keyModifier.encode('100'),
        manufacturerId: manufacturers[0].id
      },
      {
        id: '2',
        userId: keyModifier.encode('100'),
        manufacturerId: manufacturers[1].id
      },
      {
        id: '3',
        userId: keyModifier.encode('200'),
        manufacturerId: manufacturers[1].id
      }
    ];

    beforeEach(() => {
      return User.bulkCreate(users)
        .then(() => Manufacturer.bulkCreate(manufacturers))
        .then(() => UserManufacturer.bulkCreate(userManufacturers));
    });

    after(() => {
      return UserManufacturer.destroy({where: {}}).then(() => Promise.all([
        User.destroy({where: {}}),
        Manufacturer.destroy({where: {}})
      ]));
    });

    it('should delete userManufacturer by query and sync scope to users', () => {
      const query = {
        id: ['1', '3']
      };

      return helpers.makeRequest(
        'delete',
        '/sg/api/resources/objects/UserManufacturer?query=' + JSON.stringify(query)
      ).then(() => {
        return User.findAll();
      }).then(addedUsers => {
        const user0 = addedUsers.find(u => u.id === users[0].id).dataValues;
        const user1 = addedUsers.find(u => u.id === users[1].id).dataValues;

        user0.should.have.property('scope');
        user0.scope.should.deep.equal([manufacturers[1].name, manufacturers[1].code]);
        user1.should.have.property('scope');
        user1.scope.should.deep.equal([manufacturers[1].name]);
      });
    });

  });

});
