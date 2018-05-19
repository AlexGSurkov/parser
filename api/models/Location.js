module.exports = {
  attributes: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    containerId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    number: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false
    },
    states: {
      type: Sequelize.JSONB,
      allowNull: false
    }
  },

  associations() {
    Location.belongsTo(Container, {
      foreignKey: 'containerId',
      as: 'container'
    });
  },

  options: {
    timestamps: true,
    tableName: 'locations',
    hooks: {}
  }
};
