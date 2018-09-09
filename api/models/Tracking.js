module.exports = {
  attributes: {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    imo: {
      type: Sequelize.STRING,
      allowNull: false
    },
    mmsi: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lat: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lon: {
      type: Sequelize.STRING,
      allowNull: false
    },
    speed: {
      type: Sequelize.STRING,
      allowNull: false
    },
    heading: {
      type: Sequelize.STRING,
      allowNull: false
    },
    course: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false
    },
    dsrc: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },

  associations() {
    Location.belongsTo(Vessel, {
      foreignKey: 'imo',
      as: 'vessel'
    });
  },

  options: {
    timestamps: true,
    tableName: 'tracking',
    hooks: {}
  }
};
