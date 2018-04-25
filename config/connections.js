module.exports.connections = {

  staging: {
    url: process.env.DATABASE_URL,
    options: {
      host: 'localhost',
      dialect: 'postgres',
      maxConcurrentQueries: 200,
      pool: {
        max: 75,
        min: 10
      }
    }
  },

  production: {
    url: process.env.DATABASE_URL,
    options: {
      dialect: 'postgres',
      logging: () => {/* empty func */},
      maxConcurrentQueries: 200,
      pool: {
        max: 75,
        min: 10,
        idle: 500
      }
    }
  },

  development: {
    user: 'postgres',
    database: 'doctor_teu',
    password: '',
    host: 'localhost',
    options: {
      dialect: 'postgres'
    }
  },

  dev: {
    url: process.env.DATABASE_URL,
    options: {
      dialect: 'postgres',
      maxConcurrentQueries: 2,
      pool: {
        max: 2,
        min: 0,
        idle: 500
      }
    }
  },

  test: {
    host: 'localhost',
    user: 'postgres',
    password: '',
    database: 'doctor_teu_test',
    options: {
      logging: () => {/* empty func */},
      host: 'localhost',
      dialect: 'postgres',
      maxConcurrentQueries: 2,
      pool: {
        max: 2,
        min: 0,
        idle: 500
      }
    }
  }
};
