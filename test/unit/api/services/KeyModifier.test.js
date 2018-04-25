'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  KeyModifier = require(__basedir + '/../api/services/KeyModifier'),
  keyModifier = new KeyModifier('sg'),
  resource = {
    firstName: 'Антон',
    id: '12',
    storeId: '96',
    nullableField: null
  };

describe('KeyModifier test', () => {
  it('should encodeResource', () => {
    const encodedResource = keyModifier.encodeResource(Object.assign({}, resource));

    encodedResource.should.be.ok;
    encodedResource.should.have.property('id', 'sg_' + resource.id);
    encodedResource.should.have.property('storeId', 'sg_' + resource.storeId);
    encodedResource.should.have.property('firstName', resource.firstName);
    encodedResource.should.have.property('nullableField', resource.nullableField);
  });

  it('should not encode id', () => {
    const encodedResource = keyModifier.encodeResource(Object.assign({}, resource), {exclude: ['id']});

    encodedResource.should.be.ok;
    encodedResource.should.have.property('id', resource.id);
    encodedResource.should.have.property('storeId', 'sg_' + resource.storeId);
  });

  it('should decode resource', () => {

    const encodedResource = keyModifier.encodeResource(Object.assign({}, resource)),
      decodedResource = keyModifier.decodeResource(encodedResource);

    decodedResource.should.be.ok;
    decodedResource.should.have.property('id', resource.id);
    decodedResource.should.have.property('storeId', resource.storeId);
    decodedResource.should.have.property('firstName', resource.firstName);
    decodedResource.should.have.property('nullableField', resource.nullableField);
  });

  it('should encode array', () => {
    const array = ['1', '2', '3'],
      encodedArray = keyModifier.encode(array);

    encodedArray.should.be.instanceof(Array).and.have.lengthOf(array.length);
    encodedArray.forEach((item, idx) => {
      keyModifier.decode(item).should.be.equal(array[idx]);
    });
  });

  it('should decode array', () => {
    const encodedArray = keyModifier.encode(['1', '2', '3']),
      decodedArray = keyModifier.decode(encodedArray);

    decodedArray.should.be.instanceof(Array).and.have.lengthOf(encodedArray.length);
    decodedArray.forEach((item, idx) => {
      keyModifier.encode(item).should.be.equal(encodedArray[idx]);
    });
  });

  it('should encode object', () => {
    const options = {exclude: ['storeId']},
      encodedObj = keyModifier.encode({id: {id: '8', storeId: '6'}}, options);

    encodedObj.should.be.ok;
    encodedObj.id.id.should.be.equal(['sg', '8'].join('_'));
    encodedObj.id.storeId.should.be.equal('6');
  });

  it('should decode object', () => {
    const options = {exclude: ['storeId']},
      encodedObj = keyModifier.encode({id: {id: '8', storeId: '6'}}, options),
      decodedObj = keyModifier.decode(encodedObj);

    decodedObj.should.be.ok;
    decodedObj.id.id.should.be.equal('8');
    decodedObj.id.storeId.should.be.equal('6');
  });

});
