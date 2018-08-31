module.exports = {
  attributes: {
    imo: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: undefined
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    line: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },

  associations() {
    /* empty now */
  },

  options: {
    timestamps: true,
    tableName: 'vessels',
    hooks: {}
  }
};
