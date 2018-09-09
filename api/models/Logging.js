module.exports = {
  attributes: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    module: {
      type: Sequelize.STRING,
      allowNull: false
    },
    action: {
      type: Sequelize.STRING,
      allowNull: true
    },
    msg: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },

  associations() {
    // nothing yet
  },

  options: {
    timestamps: true,
    tableName: 'logging',
    hooks: {}
  }
};
