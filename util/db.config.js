const Sequelize = require('sequelize');
const env = require('./env');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  operatorsAliases: 0,
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }, 
  //dialectOptions: { useUTC: false },
  timezone: '+07:00' //for writing to database
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//import model
db.news = require('../model/news.js')(sequelize, Sequelize);
db.place = require('../model/place.js')(sequelize, Sequelize);
db.placeGroup = require('../model/placeGroup.js')(sequelize, Sequelize);
db.zone = require('../model/zone.js')(sequelize, Sequelize);
db.reserve = require('../model/reserve.js')(sequelize, Sequelize);

//Relations
//db.placeGroup.hasMany(db.place);//placeGroup เป็น many ใน place
//db.place.belongsTo(db.placeGroup);//place เป็นของ placeGroup

module.exports = db;