const request = require('supertest');

describe('AllInclusiveAPI TrimController test', () => {
  const body = {body: {
    stringWithoutTrim: 'stringWithoutTrim',
    stringWithTrim: '  stringWithTrim  ',
    array: [
      'withoutTrim',
      '  withTrim  ',
      {
        stringWithoutTrim: 'stringWithoutTrim',
        stringWithTrim: '  stringWithTrim  ',
        array: ['withoutTrim', '  withTrim  ']
      }
    ],
    object: {
      stringWithoutTrim: 'stringWithoutTrim',
      stringWithTrim: '  stringWithTrim  ',
      array: [
        'withoutTrim',
        '  withTrim  ',
        {
          stringWithoutTrim: 'stringWithoutTrim',
          stringWithTrim: '  stringWithTrim  ',
          array: ['withoutTrim', '  withTrim  ']
        }
      ]
    }
  }};

  it('it should modify req object for "/allinclusive*" path', () => {
    return request(sails.hooks.http.app)
      .post('/allinclusive/param?id=  1  ')
      .send(body)
      .expect(200)
      .expect({
        param: 'param',
        id: '1',
        body: {
          stringWithoutTrim: 'stringWithoutTrim',
          stringWithTrim: 'stringWithTrim',
          array: [
            'withoutTrim',
            'withTrim',
            {
              stringWithoutTrim: 'stringWithoutTrim',
              stringWithTrim: 'stringWithTrim',
              array: ['withoutTrim', 'withTrim']
            }
          ],
          object: {
            stringWithoutTrim: 'stringWithoutTrim',
            stringWithTrim: 'stringWithTrim',
            array: [
              'withoutTrim',
              'withTrim',
              {
                stringWithoutTrim: 'stringWithoutTrim',
                stringWithTrim: 'stringWithTrim',
                array: ['withoutTrim', 'withTrim']
              }
            ]
          }
        },
      });
  });

  it('it should not modify req object for non "/allinclusive*" path', () => {
    return request(sails.hooks.http.app)
      .post('/test/param?id=  1  ')
      .send(body)
      .expect(200)
      .expect({
        param: 'param',
        id: '  1',
        body: body.body
      });
  });
});
