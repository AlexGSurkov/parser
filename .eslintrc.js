module.exports = {
  "root": true,
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  },
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    // import sails models
    "./config/eslint/.eslintrc-sails-models",
    // import sails services
    "./config/eslint/.eslintrc-sails-services",
    // import base config
    "./config/eslint/.eslintrc-base"
  ],
  "globals": {
    "sails": true,
    "Sequelize": true,
    "SequelizeConnections": true
  }
};
