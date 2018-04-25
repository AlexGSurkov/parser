'use strict';

const Promise = require('bluebird'),
  _ = require('lodash'),
  bcrypt = require('bcrypt-nodejs');

const BCRYPT_HASH_ROUNDS = 8,
  PASSWORD_LENGTH_MIN = 5,
  PASSWORD_LENGTH_MAX = 20;

module.exports = {

  /**
   *
   * One user
   *
   */

  /**
   * Find one item by filter
   *
   * @param   {object}    filter
   * @returns {Promise}
   */
  findItemByFilter(filter = {}) {
    return User.findOne(filter).then(item => {
      if (!item) {
        throw new Error('User not found by filter');
      }
      return item;
    });
  },


  /**
   *
   * Many users
   *
   */

  /**
   * Find items by filter
   *
   * @param   {object}    filter
   * @returns {Promise}
   */
  findItemsByFilter(filter = {}) {
    return User.findAll(FilterService.handleIncludes(ScopeService.filter(filter)));
  },

  /**
   * List all users
   * todo: DEPRECATED: use "UserService.findItemsByFilter" method instead of this
   *
   * @return {Promise}
   */
  listUsers() {
    return User.findAll({
      include: [{model: User, as: 'children'}]
    });
  },

  /**
   * List all users with Stores
   * todo: DEPRECATED: use "UserService.findItemsByFilter" method instead of this
   *
   * @return {Promise}
   */
  listUsersWithStores() {
    return User.findAll({
      include: [
        {
          model: Store,
          as: 'stores',
          include: [
            {model: StoreGrade, as: 'storeGrades', attributes: ['id', 'name'], required: false},
            {model: StoreType, as: 'storeTypes', attributes: ['id', 'name'], required: false}
          ]
        }
      ]
    });
  },


  /**
   *
   * Helpers
   *
   */

  /**
   * Method to retrieve user hierarchy (stores are children of user)
   *
   * @param   {object}            params
   * @param   {string}            params.userId               root user to build hierarchy from
   * @param   {string|string[]}   params.scope                user tree scope
   * @param   {boolean}           params.includeStores        flag to include stores as user`s children
   * @param   {boolean}           params.includeStoreGrades   flag to include store grades for stores (if includeStores is enabled)
   * @param   {boolean}           params.includeStoreTypes    flag to include store types for stores (if includeStores is enabled)
   * @param   {boolean}           params.includeApps          flag to include apps for users and stores
   * @param   {string}            params.startDate            start date for apps (if enabled)
   * @param   {string}            params.finishDate           finish date for apps (if enabled)
   * @param   {string}            params.appType              type (KPI etc) for apps (if enabled)
   * @returns {Promise}
   */
  getUserHierarchy(params) {
    if (_.isEmpty(params.scope)) {
      throw new Error('User hierarchy: need to specify scopes!');
    }
    let dn = Date.now();

    return hierarchyHelper.getUserHierarchy({
      userId: params.userId,
      scope: params.scope,
      includeStores: params.includeStores,
      includeStoreGrades: params.includeStoreGrades,
      includeStoreTypes: params.includeStoreTypes
    }).then(userHierarchy => {
      sails.log.info(`User hierarchy (${params.scope}), ` +
        `stores: ${params.includeStores ? 'Y' : 'N'}, ` +
        `grades: ${params.includeStoreGrades ? 'Y' : 'N'}, ` +
        `types: ${params.includeStoreTypes ? 'Y' : 'N'}` +
        `: ${Date.now() - dn}ms`);

      // toJSON doesnt work deeply (includes are still DAOs)
      userHierarchy = cloneDeep(userHierarchy);

      if (params.includeApps) {
        dn = Date.now();
        return getAndFillHierarchyWithApps(params, userHierarchy).finally(() => {
          sails.log.info(`User hierarchy apps included: ${Date.now() - dn}ms`);
        });
      }

      return userHierarchy;
    });
  },

  /**
   * Sets new user password`s hash
   *
   * @param   {string}    phone       user phone to set new password
   * @param   {string}    password    new password will be hashed
   * @param   {string}    pin         code for user
   * @returns {Promise}
   */
  setUserPasswordHash(phone, password, pin) {
    return Promise.resolve().then(() => {
      const passwordError = checkForPasswordErrors(password);

      if (!phone) {
        throw new Error('Phone number and password must be specified');
      } else if (passwordError) {
        throw new Error(passwordError);
      }

      const salt = bcrypt.genSaltSync(BCRYPT_HASH_ROUNDS),
        passwordHash = bcrypt.hashSync(password, salt);

      return User.update(
        {
          password: passwordHash,
          pin: null,
          pinExpired: null
        },
        {
          where: {phone, pin}
        }
      );
    });

  },

  getUserPasswordHash(password) {
    const passwordError = checkForPasswordErrors(password);

    if (passwordError) {
      throw new Error(passwordError);
    }

    return bcrypt.hashSync(password, bcrypt.genSaltSync(BCRYPT_HASH_ROUNDS));
  }

};


/**
 *
 * Hierarchy helpers
 *
 */

/**
 * Get apps and fill hierarchy
 *
 * @param   {object}  params       app params
 * @param   {object}  hierarchy
 * @returns {Promise}
 */
function getAndFillHierarchyWithApps(params, hierarchy = {}) {
  let grouppedItems = hierarchyHelper.groupHierarchyByType([hierarchy], ['id']),
    storeIds = grouppedItems.store.map(item => item.id),
    userIds = grouppedItems.user.map(item => item.id);

  return Promise.all([
    AppRegistryStoreService.findItemsByFilter(_appRegistryItemsFilter('storeId', storeIds, params)),
    AppRegistryUserService.findItemsByFilter(_appRegistryItemsFilter('userId', userIds, params))
  ]).spread((appRegistryStores, appRegistryUsers) => {
    return fillHierarchyWithApps(hierarchy, cloneDeep(appRegistryStores), cloneDeep(appRegistryUsers));
  });
}

/**
 * Fill hierarchy with apps recursively
 *
 * @param   {object}    hierarchyLevel
 * @param   {object[]}  appRegistryStores
 * @param   {object[]}  appRegistryUsers
 * @param   {object}    parent
 * @returns {object}
 */
function fillHierarchyWithApps(hierarchyLevel, appRegistryStores, appRegistryUsers, parent = {id: null}) {
  if (hierarchyLevel.children) {
    hierarchyLevel.children = hierarchyLevel.children.map(child => fillHierarchyWithApps(child, appRegistryStores, appRegistryUsers, hierarchyLevel));
  }
  let {type} = hierarchyLevel,
    appRegistryItems = _.filter(type === 'store' ? appRegistryStores : appRegistryUsers, type === 'store' ? {
      storeId: hierarchyLevel.id,
      parentId: parent.id
    } : {
      userId: hierarchyLevel.id
      // disabled parent checking for users (GAR-5027)
    });

  hierarchyLevel.apps = appRegistryItems.map(appRegistryItem => {
    return Object.assign({}, appRegistryItem.app, {
      [type === 'store' ? 'AppRegistryStore' : 'AppRegistryUser']: _.omit(appRegistryItem, 'app')
    });
  });
  return hierarchyLevel;
}

/**
 * Filter for AppRegistry[Store|User] items
 *
 * @param   {string}  key
 * @param   {*}       value
 * @param   {object}  params
 * @returns {object}
 */
const _appRegistryItemsFilter = (key, value, params) => ({
  where: {
    [key]: value
  },
  include: {
    model: AppRegistry,
    as: 'app',
    where: {
      type: params.appType,
      startDate: {
        $gte: params.startDate
      },
      finishDate: {
        $lte: params.finishDate
      },
      scope: params.scope
    }
  }
});

/**
 * Clones any object deeply (useful for sequelize`s DAOs that cannot be parsed deeply by "toJSON()" or "get({raw: true})" methods)
 * Also this is much faster than lodash cloneDeep method
 *
 * @param  {*}    object    object to clone
 * @return {*}              deeply clonned object
 */
const cloneDeep = object => JSON.parse(JSON.stringify(object));

function checkForPasswordErrors(password) {
  if (!password) {
   return "Password must be specified";
  } else if (password.length < PASSWORD_LENGTH_MIN || password.length > PASSWORD_LENGTH_MAX) {
   return `Password must be in range from ${PASSWORD_LENGTH_MIN} to ${PASSWORD_LENGTH_MAX} characters`;
  }

  return null;
}
