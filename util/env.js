const env = {
    database: 'candlesfest_db',
    username: 'admin_candlesfest',
    password: 'Ktkq12%0',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  
  module.exports = env;
