const request = require('supertest');

describe('APIGateway AdminPageController test', () => {

  it('link "/v2/admin" should return admin auth page', () => {
    return request(sails.hooks.http.app)
      .get('/v2/admin')
      .expect(200);
  });

});
