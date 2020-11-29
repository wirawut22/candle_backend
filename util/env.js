const env = {
    database: 'admin_candle',
    username: 'adm_candle',
    password: 'C504_fzq',
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