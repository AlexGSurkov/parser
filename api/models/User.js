/**
 * Пользователи (ТА, админы, супервайзеры и т.п.)
 */

module.exports = {
  attributes: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    login: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    middleName: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    province: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    district: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  },

  associations() {
    //User.belongsToMany(User, {
    //  foreignKey: 'parentId',
    //  through: 'UserParent',
    //  as: 'children'
    //});
    //
    //User.belongsToMany(User, {
    //  foreignKey: 'userId',
    //  through: 'UserParent',
    //  as: 'parents'
    //});
    //
    //User.belongsToMany(Store, {
    //  foreignKey: 'userId',
    //  through: 'UserStore',
    //  as: 'stores'
    //});
    //
    //User.belongsToMany(Manufacturer, {
    //  foreignKey: 'userId',
    //  through: 'UserManufacturer',
    //  as: 'manufacturers'
    //});
    //
    //User.hasMany(UserTrack, {
    //  foreignKey: 'userId',
    //  as: 'tracks'
    //});
    //
    //User.belongsToMany(AppRegistry, {
    //  foreignKey: 'userId',
    //  through: 'AppRegistryUser',
    //  as: 'apps'
    //});
    //
    //User.belongsToMany(RBACRole, {
    //  foreignKey: 'userId',
    //  through: 'RBACRoleUser',
    //  as: 'roles'
    //});
    //
    //User.hasMany(AppActivity, {
    //  foreignKey: 'userId',
    //  as: 'appActivities'
    //});
    //
    //User.hasMany(UserDeviceToken, {
    //  foreignKey: 'userId',
    //  as: 'deviceTokens'
    //});
  },

  options: {
    timestamps: true,
    tableName: 'users',
    hooks: {}
  }
};
