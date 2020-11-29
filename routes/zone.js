// import lib
const express = require('express');
const db = require('../util/db.config');
// define variable
const sequelize = db.sequelize;
const Zone = db.zone;
const route = express.Router();
const Op = db.Sequelize.Op;

// get with id
route.get('/find/id/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  let zone = {};
  if (id) { 
    let zoneList = await sequelize.query("SELECT z.id, z.topic, z.amount, z.status, z.create_dttm, z.update_dttm FROM admin_candle.zone z WHERE z.id=(:id)", {
      replacements: {id: id},
      model: sequelize.Zone,
      mapToModel: true,
      type: db.sequelize.QueryTypes.SELECT
    })
    .then(function(objList){
      console.log(objList);
      if(objList.length>0){
        jsonResult.status_code = 500;
        jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
        jsonResult.zone = objList[0]; 
        res.json(jsonResult);
      }else{
        jsonResult.status_code = 200;
        jsonResult.message = "พบข้อมูลที่ต้องการ";
        jsonResult.zone = obj; 
        res.json(jsonResult);
      } 
    })
    .catch(function(error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.zone = {};
      res.json(jsonResult); 
    }); 
  } 
});

// get all
route.get('/find/all', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  let zoneList = await sequelize.query("SELECT z.id, z.topic, z.status, z.create_dttm, z.update_dttm FROM admin_candle.zone z", {
    replacements: {},
    model: sequelize.Zone,
    mapToModel: true,
    type: db.sequelize.QueryTypes.SELECT
  })
  .then(zones => {
    jsonResult.status_code = 200;
    jsonResult.message = "พบข้อมูล " + zones.length + " รายการ";
    jsonResult.zone_list = zones; 
    res.json(jsonResult);
  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.zone_list = [];
    res.json(jsonResult); 
  }); 
 
  
});

// get all
route.get('/find/isempty/:id/:zone_id/:amount', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const id = req.params.id;
  const zone_id = req.params.zone_id;
  const amount = req.params.amount;
  
  const jsonResult = {};

  if (isNaN(amount)) {
    jsonResult.status_code = 500;
    jsonResult.message = "จำนวนคนต้องเป็นตัวเลขเท่านั้น";
    jsonResult.is_empty = "false";
    res.json(jsonResult); 
  }


  let isEmpty = await sequelize.query(
  "SELECT "
  + "CASE WHEN (:amount)+(SUM(r.amount))>z.amount THEN 'false' ELSE 'true' END "
  + "AS empty_seat FROM admin_candle.reserve r "
  + "LEFT JOIN admin_candle.zone z "
  + "ON r.zone_id = z.id "
  + "WHERE 1=1 "
  + "AND r.status <> 'I' "
  + "AND r.id <> (:id) "
  + "AND r.zone_id = (:zone_id) ", {
    replacements: {
      id:id,
      zone_id:zone_id,
      amount:amount
    }, 
    type: db.sequelize.QueryTypes.SELECT
  })
  .then(result => {
    console.log("RESULT = "+result);
    jsonResult.status_code = 200;
    jsonResult.message = "inquery ข้อมูลสำเร็จ";
    jsonResult.is_empty = result?result[0].empty_seat:"false"; 
    res.json(jsonResult);
  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.is_empty = "false";
    res.json(jsonResult); 
  }); 
 
  
});

// get by mobile
route.get('/find/reserve/:mobile', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const mobile = req.params.mobile; 
  
  const jsonResult = {};
  
  let result = await sequelize.query(
  "SELECT z.id, r.title, r.first_name, r.last_name, z.topic AS zone, r.amount AS reserved, r.mobile, r.status FROM reserve r LEFT JOIN zone z ON r.zone_id = z.id " 
  + "WHERE 1=1 "
  + "AND z.status = 'A' AND r.mobile = :mobile" , {
  //+ "AND z.status = 'A' AND r.status = 'A' AND r.mobile = :mobile" , {
    replacements: {
      mobile:mobile
    }, 
    type: db.sequelize.QueryTypes.SELECT
  })
  .then(result => {
    console.log("RESULT = "+result);
    if(result.length>0){
      jsonResult.status_code = 200;
      jsonResult.message = "inquiry ข้อมูลสำเร็จ";
      jsonResult.reserve_list = result; 
      res.json(jsonResult);
    }else{
      jsonResult.status_code = 200;
      jsonResult.message = "ไม่พบข้อมูล";
      jsonResult.reserve_list = []; 
      res.json(jsonResult);
    }

  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.reserve_list = [];
    res.json(jsonResult); 
  }); 
 
  
});

// get all
route.get('/find/all/active', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  let zoneList = await sequelize.query("SELECT t.id, t.topic, t.amount, t.status, SUM(t.booked) AS booked, (t.amount-SUM(t.booked)) AS empty_seat, t.create_dttm, t.update_dttm FROM (SELECT z.id, z.topic, z.amount, CASE WHEN SUM(r.amount) IS NOT NULL AND r.status='A' THEN SUM(r.amount) ELSE 0 END booked, z.status, z.create_dttm, z.update_dttm FROM admin_candle.zone z LEFT JOIN admin_candle.reserve r ON z.id = r.zone_id WHERE z.status=('A') GROUP BY z.id,z.topic,r.status) AS t GROUP BY t.id",
  {
    replacements: {status: 'A'},
    model: sequelize.Zone,
    mapToModel: true,
    type: db.sequelize.QueryTypes.SELECT
  })
  .then(zones => {
    jsonResult.status_code = 200;
    jsonResult.message = "พบข้อมูล " + zones.length + " รายการ";
    jsonResult.zone_list = zones; 
    res.json(jsonResult);
  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.zone_list = [];
    res.json(jsonResult); 
  });  
});

//create
route.post('/create', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const zone = req.body; 
  let newZone = null;
  if (zone) {
    zone.create_dttm = sequelize.fn('NOW');
    zone.update_dttm = sequelize.fn('NOW');
    newZone = await sequelize.transaction(function(t) {
      // chain all your queries here. make sure you return them.
      return Zone.create(zone, { transaction: t });
    })
    .then(function(obj){ 
      jsonResult.status_code = 200;
      jsonResult.message = "เพิ่มข้อมูลเรียบร้อย"; 
      jsonResult.zone = obj; 
      res.json(jsonResult);
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.zone = {}; 
      res.json(jsonResult); 
    });
  }

});

//update
route.put('/update/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const zone = req.body;
  const id = req.params.id;
  let updateZone = null; 
  if (zone && id) { 
    zone.create_dttm = sequelize.fn('NOW');
    zone.update_dttm = sequelize.fn('NOW');
    updateZone = await sequelize.transaction(function(t) {
      return Zone.update(
        zone,
        { where: { id: id } },
        { transaction: t }
      );
    })    
    .then(function(obj){ 
      let zoneList = sequelize.query("SELECT z.id, z.topic, z.amount, z.status, z.create_dttm, z.update_dttm FROM admin_candle.zone z WHERE z.id=(:id)", {
        replacements: {id: id},
        model: sequelize.Zone,
        mapToModel: true,
        type: db.sequelize.QueryTypes.SELECT
      })
      .then(function(objList){ 
        if(objList.length>0){ 
          jsonResult.status_code = 200;
          jsonResult.message = "แก้ไขข้อมูลเรียบร้อย";
          jsonResult.zone = objList[0]; 
          res.json(jsonResult);
        }else{
          jsonResult.status_code = 500;
          jsonResult.message = "แก้ไขข้อมูลสำเร็จเเต่ไม่สามารถ inquiry ข้อมูลออกมาได้";
          jsonResult.zone = {}; 
          res.json(jsonResult);
        } 
      })
      .catch(function(error) {
        jsonResult.status_code = 500;
        jsonResult.message = error.message;
        jsonResult.zone = {};
        res.json(jsonResult); 
      });
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.zone = {};
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
  let zoneDestroy = null;
  if (id) {
    //const zone = await Zone.findByPk(id);
    Zone.destroy({
      where: {
        id:id
      }
    })
    .then(function (obj) { 
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
});

module.exports = route;