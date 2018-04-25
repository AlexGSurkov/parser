const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const should = chai.should();  // eslint-disable-line no-unused-vars

describe('ResourceFields test', () => {

  describe('#IntegerField', () => {
    let fieldMeta,
      field,
      TestModel;

    beforeEach(() => {
      fieldMeta = CustomerResourceField.build({
        name: 'test_field',
        required: true,
        type: 'integer'
      });

      field = ResourceFields.makeField(fieldMeta);

      TestModel = SequelizeConnections[sails.config.models.connection].define('TestModel', field.buildAttribute());
    });

    it('should create integer field', () => {

      field.should.be.instanceof(Object);
      field.typeName.should.be.equal('integer');

    });

    it('should validate integer field', () => {
      return field.validate(TestModel.build({
        test_field: '123456'
      })).then(() => {
        return field.validate(TestModel.build({
          test_field: 123456
        }));
      });
    });

    it('should not validate integer field', () => {
      return field.validate(TestModel.build({
        test_field: 'just string'
      })).should.eventually.be.rejected;
    });

  });


  describe('#EmailField', () => {
    let fieldMeta,
      field,
      TestModel;

    beforeEach(() => {
      fieldMeta = CustomerResourceField.build({
        name: 'test_field',
        required: true,
        type: 'email'
      });

      field = ResourceFields.makeField(fieldMeta);

      TestModel = SequelizeConnections[sails.config.models.connection].define('TestModel', field.buildAttribute());
    });

    it('should create email field', () => {

      field.should.be.instanceof(Object);
      field.typeName.should.be.equal('email');

    });


    it('should validate email field', () => {
      return field.validate(TestModel.build({
        test_field: 'test@test.com'
      })).then(() => {
        return field.validate(TestModel.build({
          test_field: 'test.test123@test.domen.com'
        }));
      });

    });


    it('should not validate email field', () => {
      return field.validate(TestModel.build({
        test_field: 'test email'
      })).should.eventually.be.rejected;
    });

    it('should not validate email field(not required)', () => {

      let field2 = ResourceFields.makeField(CustomerResourceField.build({
        name: 'test_field',
        required: false,
        type: 'email'
      }));

      let TestModel2 = SequelizeConnections[sails.config.models.connection].define('TestModel2', field2.buildAttribute());

      return field2.validate(TestModel2.build({
        test_field: 'test email'
      })).should.eventually.be.rejected;
    });

  });


  describe('#PhoneField', () => {
    let fieldMeta,
      field,
      TestModel;

    beforeEach(() => {
      fieldMeta = CustomerResourceField.build({
        name: 'test_field',
        required: true,
        type: 'phone'
      });

      field = ResourceFields.makeField(fieldMeta);

      TestModel = SequelizeConnections[sails.config.models.connection].define('TestModel', field.buildAttribute());
    });


    it('should create phone field', () => {

      field.should.be.instanceof(Object);
      field.typeName.should.be.equal('phone');

    });


    it('should validate phone field', () => {
      return field.validate(TestModel.build({
        test_field: '380934742222'
      })).then(() => {
        return field.validate(TestModel.build({
          test_field: 380934742222
        }));
      });
    });

  });


  it('should not create unknown field', () => {

    let fieldMeta = CustomerResourceField.build({
      name: 'test_field',
      required: true,
      type: 'int'
    });

    (() => {
      ResourceFields.makeField(fieldMeta);
    }).should.throw();

  });

});
