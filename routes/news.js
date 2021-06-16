// import lib
const express = require('express');
const db = require('../util/db.config');
var http = require('http');
var url = require('url') ;
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require('multer');
// define variable
const sequelize = db.sequelize;
const News = db.news;
const route = express.Router();

//define storage
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    var dir = "./uploads/news";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

//adding storage to multer
//fields is hardcode
var uploads = multer({ storage: storage }).fields([
  {
    name: 'images[0]',
    maxCount: 1
  },
  {
    name: 'images[1]',
    maxCount: 1
  },
  {
    name: 'images[2]',
    maxCount: 1
  },
  {
    name: 'images[3]',
    maxCount: 1
  },
  {
    name: 'images[4]',
    maxCount: 1
  },
  {
    name: 'images[5]',
    maxCount: 1
  },
  {
    name: 'images[6]',
    maxCount: 1
  },
  {
    name: 'images[7]',
    maxCount: 1
  },
  {
    name: 'images[8]',
    maxCount: 1
  },
  {
    name: 'images[9]',
    maxCount: 1
  },
  {
    name: 'images[10]',
    maxCount: 1
  },
  {
    name: 'images[11]',
    maxCount: 1
  },
  {
    name: 'images[12]',
    maxCount: 1
  },
  {
    name: 'images[13]',
    maxCount: 1
  },
  {
    name: 'images[14]',
    maxCount: 1
  } 

]);

// get with id
route.get('/find/id/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params); 
  const jsonResult = {};
  const id = req.params.id;
  let news = {};
  if (id) {
    news = await News.findByPk(id)
      .then(function (obj) {
        if (obj == null) { 
          jsonResult.status_code = 500;
          jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
          jsonResult.news = obj;
          res.json(jsonResult);
        } else { 
          //set image string to array 
          var images = [];
          if(obj.image){
            images = obj.image.split(",");
          }   
          obj.image = images;  
 
          jsonResult.status_code = 200;
          jsonResult.message = "พบข้อมูลที่ต้องการ";
          jsonResult.news = obj;
          res.json(jsonResult);
        }
      })
      .catch(function (error) {
        jsonResult.status_code = 500;
        jsonResult.message = error.message;
        jsonResult.news = {};
        res.json(jsonResult);
      });
  }
});

// get all
route.get('/find/all', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const newsList = await News.findAll()
    .then(function (obj) {    

      obj.forEach(function(entry) { 
        var images = [];
        if(entry.image){
          images = entry.image.split(",");
        }   
        entry.image = images;  
      });

      jsonResult.status_code = 200;
      jsonResult.message = "พบข้อมูล " + obj.length + " รายการ";
      jsonResult.news_list = obj;
      res.json(jsonResult);
    })
    .catch(function (error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.newsList = [];
      res.json(jsonResult);
    });
});
 
//create
route.post('/create', (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  console.log("BEFORE UPLOADED");

  uploads(req, res, function (err) {

    const jsonResult = {};
    const news = req.body; 

    let newNews = null;
    var fullPathStr = "";
    var hostname = req.headers.host; // hostname = 'localhost:8080'
    var pathname = url.parse(req.url).pathname; // pathname = '/MyApp'

    console.log("UPLOADED");

    if (err) {
      console.log(err);
      console.log("มีข้อผิดพลาดระหว่าง upload รูปภาพ");
    } else {
      console.log("+++++++++++++++"); 
      var filesSize = 0;
      if(req.files){
        filesSize = Object.keys(req.files).length;
      }
      console.log(filesSize);
      console.log("+++++++++++++++");
      console.log("upload รูปภาพสำเร็จ");

      for(var index=0;index<filesSize;index++){
        const obj = "images["+index+"]";
        const fullPath = "https://"+hostname + "/news/"+ req.files[obj][0].originalname;
        //const fullPath = req.files[obj][0].originalname;
        if(index==0){
          fullPathStr = fullPath;
        }else{
          fullPathStr = fullPathStr + "," + fullPath; 
        }
 
      }

      console.log("AFTER UPLOADED");

      if (news) { 
        news.image = fullPathStr;
        news.create_dttm = sequelize.fn('NOW');
        news.update_dttm = sequelize.fn('NOW');
        newNews = sequelize.transaction(function (t) {
          // chain all your queries here. make sure you return them.
          return News.create(news, { transaction: t });
        })
        .then(function (obj) { 
          jsonResult.status_code = 200;
          jsonResult.message = "เพิ่มข้อมูลเรียบร้อย";
          jsonResult.news = obj;
          res.json(jsonResult);
        })
        .catch(function (error) {
          jsonResult.status_code = 500;
          jsonResult.message = error.message;
          jsonResult.news = {};
          res.json(jsonResult);
        });
      }
    } 
  });
 
});

//update
route.put('/update/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);
  
  const id = req.params.id; 
  
  //if(news.isUpload){

    console.log("BEFORE UPLOADED"); 

    uploads(req, res, function (err) {
      const news = req.body; 
      const jsonResult = {}; 
      
      let editNews = null;
      var fullPathStr = "";
      var hostname = req.headers.host; // hostname = 'localhost:8080'
      var pathname = url.parse(req.url).pathname; // pathname = '/MyApp'
  
      console.log("UPLOADED");
  
      if (err) {
        console.log(err);
        console.log("มีข้อผิดพลาดระหว่าง upload รูปภาพ");
      } else {
        console.log("+++++++++++++++"); 
        var filesSize = 0;
        if(req.files){
          filesSize = Object.keys(req.files).length;
        }
        console.log(filesSize);
        console.log("+++++++++++++++");
        console.log("upload รูปภาพสำเร็จ");
  
        // for(var index=0;index<filesSize;index++){
        //   const obj = "images["+index+"]";
        //   const fullPath = "http://"+hostname + "/news/"+ req.files[obj][0].originalname;
        //   //const fullPath = req.files[obj][0].originalname;
        //   if(index==0){
        //     fullPathStr = fullPath;
        //   }else{
        //     fullPathStr = fullPathStr + "," + fullPath; 
        //   }
   
        // }
  
        console.log("AFTER UPLOADED");
  
        if (news && id) {  
          news.image = news.newImage; 
          news.update_dttm = sequelize.fn('NOW'); 
          editNews = sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return News.update(
              news, 
              { where: { id: id } },
              { transaction: t }
            );
          })
          .then(function (obj) {  
            News.findByPk(id)
            .then(function (obj) { 

              jsonResult.status_code = 200;
              jsonResult.message = "แก้ไขข้อมูลเรียบร้อย";
              jsonResult.news = obj;
              res.json(jsonResult);
            })
            .catch(function (error) { 
              jsonResult.status_code = 500;
              jsonResult.message = "แก้ไขข้อมูลสำเร็จเเต่ไม่สามารถ inquiry ข้อมูลออกมาได้";
              jsonResult.news = {};
              res.json(jsonResult);
            });

          })
          .catch(function (error) {
            jsonResult.status_code = 500;
            jsonResult.message = error.message;
            jsonResult.news = {};
            res.json(jsonResult);
          });
        }
      } 
    });
  // }else{
  //   console.log("image is null");
  // }

 
 
});

//delete with id
route.delete('/delete/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  let newsDestroy = null;
  if (id) {
    const news = await News.findByPk(id);
    if (news) {
      newsDestroy = await news.destroy()
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