'use strict';

const should = require('chai').should();  // eslint-disable-line no-unused-vars


describe('FilterService test', () => {

  describe('#handleIncludes method test', () => {

    describe('#Check wrong tests', () => {

      it('Some object that is NOT a filter', () => {
        (FilterService.handleIncludes({model: 'User'}).model === User).should.be.false;
      });

      it('Some non-existent model name', () => {
        const model = 'SomeNonExistentModelName';

        return Promise.resolve().then(() => FilterService.handleIncludes({
          include: {model}
        })).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal(`Model by name "${model}" not found!`);
        });
      });

      it('Some empty object', () => {
        FilterService.handleIncludes({}).should.be.an('object').and.is.empty;
      });

      it('Without any params', () => {
        FilterService.handleIncludes().should.be.an('object').and.is.empty;
      });

      it('With null as param', () => {
        should.equal(FilterService.handleIncludes(null), null);
      });

      it('With booleans as param', () => {
        FilterService.handleIncludes(false).should.be.false;
        FilterService.handleIncludes(true).should.be.true;
      });

      it('With string as param', () => {
        FilterService.handleIncludes('').should.be.a('string').and.has.length(0);
      });

    });


    describe('#Without sub-includes', () => {


      describe('With standart model instance', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {model: User}
          });

          (include.model === User).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {model: User},
              {model: Product}
            ]
          });

          (include[0].model === User).should.be.true;
          (include[1].model === Product).should.be.true;
        });

      });


      describe('With text model names', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {model: 'User'}
          });

          (include.model === User).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {model: 'User'},
              {model: 'Product'}
            ]
          });

          (include[0].model === User).should.be.true;
          (include[1].model === Product).should.be.true;
        });

      });

    });


    describe('#With sub-includes', () => {


      describe('With standart model instance', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {
              model: User,
              include: {
                model: Product
              }
            }
          });

          (include.model === User).should.be.true;
          (include.include.model === Product).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {
                model: User,
                include: {
                  model: Product
                }
              },
              {
                model: Product,
                include: {
                  model: User
                }
              }
            ]
          });

          (include[0].model === User).should.be.true;
          (include[0].include.model === Product).should.be.true;
          (include[1].model === Product).should.be.true;
          (include[1].include.model === User).should.be.true;
        });

      });


      describe('With text model names', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {
              model: 'User',
              include: {
                model: 'Product'
              }
            }
          });

          (include.model === User).should.be.true;
          (include.include.model === Product).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {
                model: 'User',
                include: {
                  model: 'Product'
                }
              },
              {
                model: 'Product',
                include: {
                  model: 'User'
                }
              }
            ]
          });

          (include[0].model === User).should.be.true;
          (include[0].include.model === Product).should.be.true;
          (include[1].model === Product).should.be.true;
          (include[1].include.model === User).should.be.true;
        });

      });

    });


    describe('#With sub-sub-includes', () => {


      describe('With standart model instance', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {
              model: User,
              include: {
                model: Product,
                include: {
                  model: User
                }
              }
            }
          });

          (include.model === User).should.be.true;
          (include.include.model === Product).should.be.true;
          (include.include.include.model === User).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {
                model: User,
                include: {
                  model: Product,
                  include: [
                    {
                      model: User
                    },
                    {
                      model: Product
                    }
                  ]
                }
              },
              {
                model: Product,
                include: {
                  model: User,
                  include: [
                    {
                      model: Product
                    },
                    {
                      model: User
                    }
                  ]
                }
              }
            ]
          });

          (include[0].model === User).should.be.true;
          (include[0].include.model === Product).should.be.true;
          (include[0].include.include[0].model === User).should.be.true;
          (include[0].include.include[1].model === Product).should.be.true;

          (include[1].model === Product).should.be.true;
          (include[1].include.model === User).should.be.true;
          (include[1].include.include[0].model === Product).should.be.true;
          (include[1].include.include[1].model === User).should.be.true;
        });

      });


      describe('With text model names and instances MIXED', () => {

        it('include as object', () => {
          const {include} = FilterService.handleIncludes({
            include: {
              model: 'User',
              include: {
                model: 'Product',
                include: [
                  {
                    model: User
                  },
                  {
                    model: 'Product'
                  }
                ]
              }
            }
          });

          (include.model === User).should.be.true;
          (include.include.model === Product).should.be.true;
          (include.include.include[0].model === User).should.be.true;
          (include.include.include[1].model === Product).should.be.true;
        });

        it('include as array with objects', () => {
          const {include} = FilterService.handleIncludes({
            include: [
              {
                model: 'User',
                include: {
                  model: 'Product',
                  include: [
                    {
                      model: User
                    },
                    {
                      model: 'Product'
                    }
                  ]
                }
              },
              {
                model: 'Product',
                include: {
                  model: 'User',
                  include: [
                    {
                      model: Product
                    },
                    {
                      model: 'User'
                    }
                  ]
                }
              }
            ]
          });

          (include[0].model === User).should.be.true;
          (include[0].include.model === Product).should.be.true;
          (include[0].include.include[0].model === User).should.be.true;
          (include[0].include.include[1].model === Product).should.be.true;

          (include[1].model === Product).should.be.true;
          (include[1].include.model === User).should.be.true;
          (include[1].include.include[0].model === Product).should.be.true;
          (include[1].include.include[1].model === User).should.be.true;
        });

      });

    });

  });

});
