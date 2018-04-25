'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  helpers = require(__basedir + '/helpers'),
  _ = require('lodash');

/**
 *
 * RBAC Service unit tests
 *
 */

describe('RBACService tests', () => {

  describe('#single permission tests', () => {

    let permissionCode = 'allow_test',
      errorMessage = 'You have not rights to check this test',
      userId = null;

    before(() => {
      /**
       * Create test role
       */
      return RBACPermissionGroup.create({
        title: 'Test group'
      }).then(group => {
        return Promise.all([
          RBACPermission.create({
            code: permissionCode,
            title: 'Test permission',
            errorMessage,
            groupId: group.id
          }),
          RBACRole.create({
            title: 'Tester role'
          })
        ]);
      }).then(([permission, role]) => {
        return Promise.all([
          RBACRolePermission.create({
            roleId: role.id,
            permissionId: permission.id
          }).then(() => role),
          User.create({
            login: 'Tester',
            firstName: 'Nice',
            lastName: 'Tester',
            phone: '380123456789'
          })
        ]);
      }).then(([role, user]) => {
        userId = user.id;

        return RBACRoleUser.create({
          roleId: role.id,
          userId: user.id
        });
      });
    });

    after(() => helpers.clearAllTables());

    describe('RBAC "Can" methods (boolean answer)', () => {

      it('should throw error for non existent permission (No permission with code "unknown_permission_code" found)', () => {
        return RBACService.can(userId, 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should return true for correct user and permission', () => {
        return RBACService.can(userId, permissionCode).then(result => {
          result.should.be.true;
        });
      });

      it('should return false for non existent user and correct permission', () => {
        return RBACService.can('unknown_user_id', permissionCode).then(result => {
          result.should.be.false;
        });
      });

      it('should throw error for non existent permission and non existent user', () => {
        return RBACService.can('unknown_user_id', 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

    });

    describe('RBAC "Access" methods (boolean "true" answer or throws error)', () => {

      it('should throw error for non existent permission (No permission with code "unknown_permission_code" found)', () => {
        return RBACService.access(userId, 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should return true for correct user and permission', () => {
        return RBACService.access(userId, permissionCode).then(result => {
          result.should.be.true;
        });
      });

      it('should throw error for non existent user and correct permission (You have not rights to test this test)', () => {
        return RBACService.access('unknown_user_id', permissionCode).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal(errorMessage);
        });
      });

      it('should throw error for non existent permission and non existent user', () => {
        return RBACService.access('unknown_user_id', 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

    });

    describe('RBAC "getAllUserPermissions" methods', () => {

      it('should return one permission code', () => {
        return RBACService.getAllUserPermissionCodes(userId).then(result => {
          result.should.be.an('array').and.have.lengthOf(1);
          result[0].should.be.equal(permissionCode);
        });
      });

    });

  });


  describe('#multiple permissions tests', () => {

    let permissionsData = [
        {
          code: 'allow_test1',
          title: 'Test permission 1',
          errorMessage: 'You have not rights to check this test 1',
          groupId: null
        },
        {
          code: 'allow_test2',
          title: 'Test permission 2',
          errorMessage: 'You have not rights to check this test 2',
          groupId: null
        },
        {
          code: 'allow_test3',
          title: 'Test permission 3',
          errorMessage: 'You have not rights to check this test 3',
          groupId: null
        }
      ],
      userItem = null,
      permissionCodes = permissionsData.map(permission => permission.code),
      permissionErrors = permissionsData.map(permission => permission.errorMessage),
      permissionThatDontBelongsToUser = {
        code: 'some_another_permission_code',
        title: 'Some permission',
        errorMessage: 'Some permission that not accessible for you'
      };

    before(() => {
      /**
       * Create test role
       */
      return RBACPermissionGroup.create({
        title: 'Test group'
      }).then(group => {
        permissionThatDontBelongsToUser.groupId = group.id;
        RBACPermission.create(permissionThatDontBelongsToUser);

        return group;
      }).then(group => {
        return Promise.all([
          RBACPermission.bulkCreate(
            permissionsData.map(permission => {
              permission.groupId = group.id;

              return permission;
            }),
            {returning: true}
          ),
          RBACRole.create({title: 'Tester role'})
        ]);
      }).then(([permissions, role]) => {
        return Promise.all([
          RBACRolePermission.bulkCreate(permissions.map(permission => ({
            roleId: role.id,
            permissionId: permission.id
          }))).then(() => role),
          User.create({
            login: 'Tester',
            firstName: 'Nice',
            lastName: 'Tester',
            phone: '380123456789'
          })
        ]);
      }).then(([role, user]) => {
        userItem = user;

        return RBACRoleUser.create({
          roleId: role.id,
          userId: user.id
        });
      });
    });

    after(() => helpers.clearAllTables());

    describe('RBAC "Can" methods for multiple permissions (boolean answer)', () => {

      it('should throw error for non existent permission (No permission with code "unknown_permission_code" found)', () => {
        return RBACService.can(userItem, 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should return true for correct user and FEW permissions', () => {
        return RBACService.can(userItem, permissionCodes).then(result => {
          result.should.be.true;
        });
      });

      it('should return false for non existent user and correct FEW permissions', () => {
        return RBACService.can('unknown_user_id', permissionCodes).then(result => {
          result.should.be.false;
        });
      });

      it('should throw error for non existent permission and non existent user', () => {
        return RBACService.can('unknown_user_id', 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should return false for correct user and FEW permissions with one that dont belongs to user', () => {
        return RBACService.can(userItem, permissionCodes.concat(permissionThatDontBelongsToUser.code)).then(result => {
          result.should.be.false;
        });
      });

      it('should throw error for correct user and FEW permissions with one that doesnt exist', () => {
        return RBACService.can(userItem, permissionCodes.concat('unknown_permission_code')).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should throw error for correct user and one permission user dont have with one that doesnt exist', () => {
        return RBACService.can(userItem, [permissionThatDontBelongsToUser.code, 'unknown_permission_code']).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

    });

    describe('RBAC "Access" methods for multiple permissions (boolean "true" answer or throws error)', () => {

      it('should throw error for non existent permission (No permission with code "unknown_permission_code" found)', () => {
        return RBACService.access(userItem, 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should return true for correct user and FEW permissions', () => {
        return RBACService.access(userItem, permissionCodes).then(result => {
          result.should.be.true;
        });
      });

      it('should throw error for non existent user and correct FEW permissions (You have not rights to test this test)', () => {
        return RBACService.access('unknown_user_id', permissionCodes).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal(permissionErrors.join('. '));
        });
      });

      it('should throw error for non existent permission and non existent user', () => {
        return RBACService.access('unknown_user_id', 'unknown_permission_code').then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should throw error for correct user and FEW permissions with one that dont belongs to user', () => {
        return RBACService.access(userItem, permissionCodes.concat(permissionThatDontBelongsToUser.code)).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal(permissionThatDontBelongsToUser.errorMessage);
        });
      });

      it('should throw error for correct user and FEW permissions with one that doesnt exist', () => {
        return RBACService.access(userItem, permissionCodes.concat('unknown_permission_code')).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

      it('should throw error for correct user and one permission user dont have with one that doesnt exist', () => {
        return RBACService.access(userItem, [permissionThatDontBelongsToUser.code, 'unknown_permission_code']).then(() => {
          throw new Error('Promise should be rejected');
        }).catch(e => {
          e.message.should.be.equal('No permission with code "unknown_permission_code" found');
        });
      });

    });

    describe('RBAC "getAllUserPermissions" methods', () => {

      it('should return FEW permission codes', () => {
        return RBACService.getAllUserPermissionCodes(userItem).then(codes => {
          _.intersection(permissionCodes, codes).should.have.lengthOf(permissionCodes.length);
        });
      });

    });

  });

});
