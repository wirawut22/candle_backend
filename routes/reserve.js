// import lib
const express = require('express');
const db = require('../util/db.config');
// define variable
const sequelize = db.sequelize;
const Reserve = db.reserve;
const Zone = db.zone;
const route = express.Router();

// get with id
route.get('/find/id/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  let reserve = {};
  if (id) { 
    reserve = await Reserve.findByPk(id)
    .then(function(obj){
      if(obj==null){
        jsonResult.status_code = 500;
        jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
        jsonResult.reserve = obj; 
        res.json(jsonResult);
      }else{
        jsonResult.status_code = 200;
        jsonResult.message = "พบข้อมูลที่ต้องการ";
        jsonResult.reserve = obj; 
        res.json(jsonResult);
      } 
    })
    .catch(function(error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.reserve = {};
      res.json(jsonResult); 
    }); 
  } 
});

// get all
route.get('/find/all', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  Zone.hasMany(Reserve, {foreignKey: 'zone_id'})
  Reserve.belongsTo(Zone, {foreignKey: 'zone_id'})

  const jsonResult = {};
  const reserveList = await Reserve.findAll(
    { 
      //where:{id: 2}, 
      attributes: ['id', 'zone_id', 'title', 'first_name', 'last_name', 'mobile', 'amount', 'status', 'create_dttm', 'update_dttm'],
      include: [
        {
          model:Zone,
          attributes: [['id','zone_id'], ['topic','zone_topic']]
        }
      ]
    }
  ) 
  .then(function(obj){ 
    jsonResult.status_code = 200;
    jsonResult.message = "พบข้อมูล " + obj.length + " รายการ";
    jsonResult.reserve_list = obj; 
    res.json(jsonResult);
  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.reserve_list = [];
    res.json(jsonResult); 
  }); 
});

//create
route.post('/create', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const reserve = req.body; 
  let newReserve = null;
  if (reserve) {
    reserve.create_dttm = sequelize.fn('NOW');
    reserve.update_dttm = sequelize.fn('NOW');
    newReserve = await sequelize.transaction(function(t) {
      // chain all your queries here. make sure you return them.
      return Reserve.create(reserve, { transaction: t });
    })
    .then(function(obj){ 

      Zone.hasMany(Reserve, {foreignKey: 'zone_id'})
      Reserve.belongsTo(Zone, {foreignKey: 'zone_id'})

      //ดึงข้อมูลล่าสุดไว้เซต state
      Reserve.findOne({
        where: { id: obj.id }, 
          attributes: ['id', 'zone_id', 'title', 'first_name', 'last_name', 'mobile', 'amount', 'status', 'create_dttm', 'update_dttm'],
          include: [
            {
              model:Zone,
              attributes: [['id','zone_id'], ['topic','zone_topic']]
            }
          ]
        })
        .then(function (obj) {
          if (obj == null) { 
            jsonResult.status_code = 500;
            jsonResult.message = error.message;
            jsonResult.reserve = {};
            res.json(jsonResult);
          } else { 
            jsonResult.status_code = 200;
            jsonResult.message = "เพิ่มข้อมูลเรียบร้อย";
            jsonResult.reserve = obj;
            res.json(jsonResult);
          }
        })
        .catch(function (error) { 
          jsonResult.status_code = 500;
          jsonResult.message = error.message;
          jsonResult.reserve = {};
          res.json(jsonResult);
        });
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.reserve = {}; 
      res.json(jsonResult); 
    });
  }

});

//update
route.put('/update/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

console.log("DATE = "+JSON.stringify(sequelize.fn('NOW')));

  const jsonResult = {};
  const reserve = req.body;
  const id = req.params.id;
  let updateReserve = null; 
  if (reserve && id) { 
    reserve.create_dttm = sequelize.fn('NOW');
    reserve.update_dttm = sequelize.fn('NOW');
    updateReserve = await sequelize.transaction(function(t) {
      return Reserve.update(
        reserve,
        { where: { id: id } },
        { transaction: t }
      );
    })    
    .then(function(obj){  
      Reserve.findOne({
        where: { id: id}, 
          attributes: ['id', 'zone_id', 'title', 'first_name', 'last_name', 'mobile', 'amount', 'status', 'create_dttm', 'update_dttm'],
          include: [
            {
              model:Zone,
              attributes: [['id','zone_id'], ['topic','zone_topic']]
            }
          ]
        })
        .then(function (obj) {   
          jsonResult.status_code = 200;
          jsonResult.message = "แก้ไขข้อมูลเรียบร้อย";
          jsonResult.reserve = obj;
          res.json(jsonResult);
        })
        .catch(function (error) { 
          jsonResult.status_code = 500;
          jsonResult.message = "แก้ไขข้อมูลสำเร็จเเต่ไม่สามารถ inquiry ข้อมูลออกมาได้";
          jsonResult.reserve = {};
          res.json(jsonResult);
        });
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.reserve = {};
      res.json(jsonResult); 
    });
  } 
});

//delete with id
route.delete('/delete/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  let reserveDestroy = null;
  if (id) {
    const reserve = await Reserve.findByPk(id);
    if (reserve) {
      reserveDestroy = await reserve.destroy()
        .then(function (obj) {
          console.log("id = " + id);
          jsonResult.status_code = 200;
          jsonResult.message = "ลบข้อมูลเรียบร้อย";
          jsonResult.id = id;
          res.json(jsonResult);
        })
        .catch(function (error) {
          jsonResult.status_code = 500;
          jsonResult.message = error.message;
          jsonResult.id = "";
          res.json(jsonResult);
        });
    }
  }
});

module.exports = route;