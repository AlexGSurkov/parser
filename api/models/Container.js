module.exports = {
  attributes: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    number: {
      type: Sequelize.STRING,
      allowNull: false
    },
    line: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    billOfLadingNumber: {
      type: Sequelize.STRING,
      defaultValue: '',
      allowNull: false
    },
    eta: {
      type: Sequelize.JSONB,
      allowNull: false
    },
    currentState: {
      type: Sequelize.JSONB,
      allowNull: false
    }
  },

  associations() {
    Container.hasMany(Location, {
      foreignKey: 'containerId',
      as: 'locations'
    });

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
    tableName: 'containers',
    hooks: {}
  }
};

