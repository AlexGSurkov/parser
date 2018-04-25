'use strict';

let request = require('supertest'),
  assert = require('assert'),
  helpers = require(__basedir + '/helpers'),
  userId;

describe('AllInclusiveAPI TrackController Test', () => {

  before(() => {
    return User.create({
      id: 'qwer',
      login: 'login',
      password: 'password',
      firstName: 'QA',
      lastName: 'test',
      middleName: 'John',
      phone: '0501234567',
      province: 'v',
      city: 'N',
      address: 'N'
    }).then(({id} = {}) => {
      sails.log.info(`User id: ${id}`);

      userId = id;
    });
  });

  after(() => helpers.clearAllTables());

  it('should create event without coordinates', () => {
    const eventData = {
      event: 'signin'
    };

    return request(sails.hooks.http.app)
      .post('/allInclusive/user/' + userId + '/tracks')
      .send(eventData)
      .then(res => {
        if (res.body.status === 'error') {
          throw new Error(res.body.errorMsg);
        }

        assert.equal(res.body.data.event, eventData.event);
      });
  });

  it('should create event with coordinates', () => {
    const coordinateFields = ['latitude', 'longitude', 'altitude', 'accuracy'],
      eventData = {
        event: 'signup',
        coordinates: {
          latitude: 323.34,
          longitude: 2334.343,
          altitude: 23,
          accuracy: 1,
          timestamp: 1448561559152
        }
      };

    return request(sails.hooks.http.app)
      .post('/allInclusive/user/' + userId + '/tracks')
      .send(eventData)
      .then(res => {
        if (res.body.status === 'error') {
          throw new Error(res.body.errorMsg);
        }

        return UserTrack.findById(res.body.data.id, {
          include: {
            model: UserTrackCoordinates,
            as: 'coordinates'
          }
        });
      }).then(res => {
        assert.equal(res.event, eventData.event);

        coordinateFields.forEach(field => {
          assert.equal(res.coordinates[field], eventData.coordinates[field]);
        });
      });
  });

});
