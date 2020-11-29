// import lib
const express = require('express');
const db = require('../util/db.config');
// define variable
const sequelize = db.sequelize;
const PlaceGroup = db.placeGroup;
const route = express.Router();

// get with id
route.get('/find/id/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  let placeGroup = {};
  if (id) { 
    placeGroup = await PlaceGroup.findByPk(id)
    .then(function(obj){
      if(obj==null){
        jsonResult.status_code = 500;
        jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
        jsonResult.place_group = obj; 
        res.json(jsonResult);
      }else{
        jsonResult.status_code = 200;
        jsonResult.message = "พบข้อมูลที่ต้องการ";
        jsonResult.place_group = obj; 
        res.json(jsonResult);
      } 
    })
    .catch(function(error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.place_group = {};
      res.json(jsonResult); 
    }); 
  } 
});

// get all
route.get('/find/all', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const placeGroupList = await PlaceGroup.findAll()
  .then(function(obj){ 
    jsonResult.status_code = 200;
    jsonResult.message = "พบข้อมูล " + obj.length + " รายการ";
    jsonResult.place_group_list = obj; 
    res.json(jsonResult);
  })
  .catch(function(error) { 
    jsonResult.status_code = 500;
    jsonResult.message = error.message;
    jsonResult.place_group_list = [];
    res.json(jsonResult); 
  }); 
});

//create
route.post('/create', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const placeGroup = req.body; 
  let newPlaceGroup = null;
  if (placeGroup) {
    placeGroup.create_dttm = sequelize.fn('NOW');
    placeGroup.update_dttm = sequelize.fn('NOW');
    newPlaceGroup = await sequelize.transaction(function(t) {
      // chain all your queries here. make sure you return them.
      return PlaceGroup.create(placeGroup, { transaction: t });
    })
    .then(function(obj){ 
      jsonResult.status_code = 200;
      jsonResult.message = "เพิ่มข้อมูลเรียบร้อย"; 
      jsonResult.place_group = obj; 
      res.json(jsonResult);
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.place_group = {}; 
      res.json(jsonResult); 
    });
  }

});

//update
route.put('/update/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const placeGroup = req.body;
  const id = req.params.id;
  let updatePlaceGroup = null; 
  if (placeGroup && id) {
    placeGroup.create_dttm = sequelize.fn('NOW');
    placeGroup.update_dttm = sequelize.fn('NOW');
    updatePlaceGroup = await sequelize.transaction(function(t) {
      return PlaceGroup.update(
        placeGroup,
        { where: { id: id } },
        { transaction: t }
      );
    })    
    .then(function(obj){ 
      PlaceGroup.findByPk(id)
      .then(function (obj){
        jsonResult.status_code = 200;
        jsonResult.message = "แก้ไขข้อมูลเรียบร้อย";
        jsonResult.place_group = obj;
        res.json(jsonResult);
      })
      .catch(function (error) { 
        jsonResult.status_code = 500;
        jsonResult.message = "แก้ไขข้อมูลสำเร็จเเต่ไม่สามารถ inquiry ข้อมูลออกมาได้";
        jsonResult.place_group = {};
        res.json(jsonResult);
      });
    })
    .catch(function(error) { 
      jsonResult.status_code = 500;
      jsonResult.message = error.message; 
      jsonResult.place_group = {};
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
  let placeGroupDestroy = null;
  if (id) {
    const placeGroup = await PlaceGroup.findByPk(id);
    if (placeGroup) {
      placeGroupDestroy = await placeGroup.destroy()
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