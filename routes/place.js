// import lib
const express = require('express');
var distance = require('google-distance-matrix');
const db = require('../util/db.config');
var http = require('http');
var url = require('url') ;
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require('multer');
const { log } = require('console');
const sequelize = db.sequelize;
const Place = db.place;
const PlaceGroup = db.placeGroup;
const route = express.Router();

//define storage
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    var dir = "./uploads/place";
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
 
const API_KEY = 'AIzaSyB4UH9t_QJ7nVypuKbNqbx25ffRSD-pvTA';

//normal function
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

// get with id by latitude longtitude
route.get('/find/id/:id/:latitude/:longtitude', (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};
  const id = req.params.id;
  const latitude = req.params.latitude;
  const longtitude = req.params.longtitude;

  
  //set distance property
  distance.key(API_KEY);
  distance.units('metric');
  distance.mode('driving');
  distance.language('th');

  var place = {};
  if (id) {
    place = Place.findByPk(id)
      .then(function (obj) {

        if (obj) {  

          var origins = [latitude + "," + longtitude]; 
          var destinations = [obj.latitude + "," + obj.longtitude];

          distance.matrix(origins, destinations, function (err, distances) {

            var dataList = [];
    
            if (err) {
              return console.log(err);
            }
            if (!distances) {
              return console.log('no distances');
            }
            if (distances.status == 'OK') {
              for (var i = 0; i < origins.length; i++) {
                for (var j = 0; j < destinations.length; j++) {

                  var origin = distances.origin_addresses[i];
                  var destination = distances.destination_addresses[j];

                  var distance = "0.00";
                  var duration = "0.00";

                  if (distances.rows[0].elements[j].status == 'OK') {
                    distance = distances.rows[i].elements[j].distance.value;
                    duration = distances.rows[i].elements[j].duration.value;
                    if (distance) {
                      distance = parseFloat(distance / 1000).toFixed(2);
                    }
    
                    if (duration) {
                      duration = parseFloat(duration / 60).toFixed(2);
                    }

                    console.log("distance = "+distance);
                  } else {
                    console.log(destination + ' is not reachable by land from ' + origin);
                  }
                  const target = obj.dataValues;
                  const source = { distance: distance, distance_unit: 'กิโลเมตร', duration: duration, duration_unit: 'นาที' };
                  //tranfer object target to source
                  const returnedTarget = Object.assign(target, source);
    
                  // console.log("++++++++++++++++++++");
                  // console.log(returnedTarget);
                  // console.log("++++++++++++++++++++");

                              //set image string to array 
                  var images = [];
                  if(returnedTarget.image){
                    images = returnedTarget.image.split(",");
                  }   
                  returnedTarget.image = images;  

                  jsonResult.status_code = 200;
                  jsonResult.message = "พบข้อมูลที่ต้องการ";
                  jsonResult.place = returnedTarget;
                  res.json(jsonResult);
 
                }

              }
     
            }
      
          }); 

        } else { 
          jsonResult.status_code = 500;
          jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
          jsonResult.place = obj;
          res.json(jsonResult);
        }
      })
      .catch(function (error) {
        jsonResult.status_code = 500;
        jsonResult.message = error.message;
        jsonResult.place = {};
        res.json(jsonResult);
      });
  }
});

// get with id
route.get('/find/id/:id', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};

  PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
  Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})

  const id = req.params.id;
  let place = {};
  if (id) {
    place = await Place.findOne({
      where: { id: id }, 
      attributes: ['id', 'topic', 'address', 'group_id', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
      include: [
        {
          model:PlaceGroup,
          attributes: [['id','group_id'], ['topic','group_topic']]
        }
      ]
    })
      .then(function (obj) {   
        
        if (obj == null) {
          console.log("xfffff = ") ;
          jsonResult.status_code = 500;
          jsonResult.message = "ไม่พบข้อมูลที่ต้องการ";
          jsonResult.place = obj;
          res.json(jsonResult);
        } else {

          var images = [];
          if(obj.image){
            images = obj.image.split(",");
          }   
          obj.image = images;  
             
          jsonResult.status_code = 200;
          jsonResult.message = "พบข้อมูลที่ต้องการ";  
          jsonResult.place = obj;
          res.json(jsonResult);
        }
      })
      .catch(function (error) {
        jsonResult.status_code = 500;
        jsonResult.message = error.message;
        jsonResult.place = {};
        res.json(jsonResult);
      });
  }
});

// get with group id
route.get('/find/group_id/:group_id', (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const group_id = req.params.group_id;
  console.log("group_id = " + group_id);
  var jsonResult = {};
  if (group_id) {
    const placeList = Place.findAll({
      where: {
        group_id: group_id
      }
    })
      .then(function (obj) {

        if (obj.length > 0) {
          
          obj.forEach(function(entry) { 
            var images = [];
            if(entry.image){
              images = entry.image.split(",");
            }   
            entry.image = images;  
          }); 

          jsonResult.status_code = 200;
          jsonResult.message = "พบข้อมูล " + obj.length + " รายการ";
          jsonResult.place_list = obj;
          res.json(jsonResult);
        } else {
          jsonResult.status_code = 200;
          jsonResult.message = "ไม่พบรายการที่ค้นหา";
          jsonResult.place_list = obj;
          res.json(jsonResult);
        }

      })
      .catch(function (error) {
        jsonResult.status_code = 500;
        jsonResult.message = error.message;
        jsonResult.place_list = [];
        res.json(jsonResult);
      });
  } else {
    jsonResult.status_code = 200;
    jsonResult.message = "กรุณาระบุ group_id";
    jsonResult.place = [];
    res.json(jsonResult);
  }

});

// get all
route.get('/find/all', async (req, res, next) => {
  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const jsonResult = {};

  PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
  Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})

  const placeList = await Place.findAll(    
    { 
    //where:{id: 2}, 
    attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
    include: [
      {
        model:PlaceGroup,
        attributes: [['id','group_id'], ['topic','group_topic']]
      }
    ]
    }
    )
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
      jsonResult.place_list = obj;
      res.json(jsonResult);
    })
    .catch(function (error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.place_list = [];
      res.json(jsonResult);
    });
});

// get all by latitude
route.get('/find/all/:latitude/:longtitude', (req, res, next) => {

  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const latitude = req.params.latitude;
  const longtitude = req.params.longtitude;

  //set distance property
  distance.key(API_KEY);
  distance.units('metric');
  distance.mode('driving');
  distance.language('th');

  var jsonResult = {};

  PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
  Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})
  
  const placeList = Place.findAll(
    { 
    //where:{id: 2}, 
    attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
    include: [
      {
        model:PlaceGroup,
        attributes: [['id','group_id'], ['topic','group_topic']]
      }
    ]
    }
    ).then(function (objList) {

      var origins = [latitude + "," + longtitude];
      //var origins = ['13.744950999999999,100.5622064'];
      var destinations = [];
      //var destinations = ['13.7993922,100.5465864','13.809500,100.570890', '13.7450547,100.561518'];

      objList.forEach(function (obj) { 
        //set destination
        const destination = obj.latitude + "," + obj.longtitude;
        destinations.push(destination);
      });
      console.log("DISTANCE MATRIX");
      distance.matrix(origins, destinations, async function (err, distances) {
        console.log("DISTANCE MATRIX2");
        var dataList = [];

        if (err) {
          console.log("ERR");
          return console.log(err);
        }
        if (!distances) {
          console.log("NO");
          return console.log('no distances');
        }
        console.log("distances.status="+distances.status);
        if (distances.status == 'OK') {
          console.log("DISTANCE OK");
          for (var i = 0; i < origins.length; i++) {
            for (var j = 0; j < destinations.length; j++) {
              var origin = distances.origin_addresses[i];
              var destination = distances.destination_addresses[j];
              var distance = "0.00";
              var duration = "0.00";
              if (distances.rows[0].elements[j].status == 'OK') {
                distance = distances.rows[i].elements[j].distance.value;
                duration = distances.rows[i].elements[j].duration.value;
                if (distance) {
                  distance = parseFloat(distance / 1000).toFixed(2);
                }

                if (duration) {
                  duration = parseFloat(duration / 60).toFixed(2);
                }
              } else {
                console.log(destination + ' is not reachable by land from ' + origin);
              }
              const target = objList[j].dataValues;
              const source = { distance: distance, distance_unit: 'กิโลเมตร', duration: duration, duration_unit: 'นาที' };
              //tranfer object target to source
              var returnedTarget = Object.assign(target, source);

              //set image string to array 
              var images = [];
              if(returnedTarget.image){
                images = returnedTarget.image.split(",");
              }   
              returnedTarget.image = images;   

              console.log("++++++++++++++++++++");
              console.log(returnedTarget);
              console.log("++++++++++++++++++++");

              dataList.push(returnedTarget);
            }

          }


          // objList.forEach(function (entry) {
          //   //set image to array
          //   var images = [];
          //   if(entry.image){
          //    images = entry.image.split(",");
          //   }
          //   obj.image = images;  
          // });

          jsonResult.status_code = 200;
          jsonResult.message = "พบข้อมูล " + objList.length + " รายการ";
          jsonResult.place_list = dataList;
          res.json(jsonResult);

        }else{
          console.log("CCC");
        }
 

      });



    })
    .catch(function (error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.place_list = [];
      res.json(jsonResult);
    });
});


// get all into group
route.get('/find/combine/:latitude/:longtitude', (req, res, next) => {

  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const latitude = req.params.latitude;
  const longtitude = req.params.longtitude;

  //set distance property
  distance.key(API_KEY);
  distance.units('metric');
  distance.mode('driving');
  distance.language('th');

  var jsonResult = {};
  var combineList = [];

  //set origins
  var origins = [latitude + "," + longtitude];
  //var origins = ['13.744950999999999,100.5622064'];

  PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
  Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})

  Place.findAll(
    { 
    //where:{id: 2}, 
    attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
    include: [
      {
        model:PlaceGroup,
        attributes: [['id','group_id'], ['topic','group_topic']]
      }
    ]
    }
    ).then(function (dataList) { 

      const grouped = groupBy(dataList, data => data.group_id);
      const groupIdList = [...new Set(dataList.map(item => item.group_id))];

      groupIdList.forEach(async function (group_id) {

        var placeObj = {};
        placeObj.group_id = group_id;

        var placeList = grouped.get(group_id);

        //set destinations
        var destinations = [];
        placeList.forEach(function (obj) {
          const destination = obj.latitude + "," + obj.longtitude;
          destinations.push(destination);
        });


        var promiseDistanceMetrix = new Promise(function (resolve, reject) {

          console.log("START NEW PROMISE");

          //calculate distance
          distance.matrix(origins, destinations, function (err, distances) {

            var dataList = [];

            if (err) {
              return console.log(err);
            }
            if (!distances) {
              return console.log('no distances');
            }
            if (distances.status == 'OK') {
              for (var i = 0; i < origins.length; i++) {
                for (var j = 0; j < destinations.length; j++) {
                  var distance = "0.00";
                  var duration = "0.00";
                  var origin = distances.origin_addresses[i];
                  var destination = distances.destination_addresses[j];

                  if (distances.rows[0].elements[j].status == 'OK') {
                    distance = distances.rows[i].elements[j].distance.value;
                    duration = distances.rows[i].elements[j].duration.value;
                    if (distance) {
                      distance = parseFloat(distance / 1000).toFixed(2);
                    }

                    if (duration) {
                      duration = parseFloat(duration / 60).toFixed(2);
                    }
                    //console.log('ตำเเหน่งที่ ' + j + ' ระยะทางจาก ' + origin + ' ถึง ' + destination + ' คือ ' + distance);
                  } else {
                    console.log(destination + ' is not reachable by land from ' + origin);
                  }
                  const target = placeList[j].dataValues;
                  const source = { distance: distance, distance_unit: 'กิโลเมตร', duration: duration, duration_unit: 'นาที' };
                  //tranfer object target to source
                  var returnedTarget = Object.assign(target, source);

                  // console.log("++++++++++++++++++++");
                  // console.log(returnedTarget);
                  // console.log("++++++++++++++++++++");

                  //set image string to array 
                  var images = [];
                  if(returnedTarget.image){
                    images = returnedTarget.image.split(",");
                  }   
                  returnedTarget.image = images;   

                  dataList.push(returnedTarget);
                }

              }

              placeObj.place_list = dataList;
              resolve(placeObj);
            }
          });
 
        });

        promiseDistanceMetrix.then(function (placeObj) { 
          combineList.push(placeObj);  
        });
      });

      setTimeout(() => { 
        jsonResult.status_code = 200;
        jsonResult.message = "พบข้อมูล " + dataList.length + " รายการ";
        jsonResult.combine_list = combineList;
        res.json(jsonResult);
      }, 1000);
 

    })
    .catch(function (error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.combine_list = [];
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
    const place = req.body; 

    let newPlace = null;
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
        const fullPath = "http://"+hostname + "/place/"+ req.files[obj][0].originalname;
        //const fullPath = req.files[obj][0].originalname;
        if(index==0){
          fullPathStr = fullPath;
        }else{
          fullPathStr = fullPathStr + "," + fullPath; 
        }
 
      }

      console.log("AFTER UPLOADED");

      if (place) { 
        place.image = fullPathStr;
        place.create_dttm = sequelize.fn('NOW');
        place.update_dttm = sequelize.fn('NOW');
        newPlace = sequelize.transaction(function (t) {
          // chain all your queries here. make sure you return them.
          return Place.create(place, { transaction: t });
        })
        .then(function (obj) { 

          console.log("id = "+JSON.stringify(obj));

          PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
          Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})

          //ดึงข้อมูลล่าสุดไว้เซต state
          Place.findOne({
            where: { id: obj.id }, 
            attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
            include: [
              {
                model:PlaceGroup,
                attributes: [['id','group_id'], ['topic','group_topic']]
              }
            ]
          })
          .then(function (obj) {
              if (obj == null) { 
                jsonResult.status_code = 500;
                jsonResult.message = error.message;
                jsonResult.place = {};
                res.json(jsonResult);
              } else { 
                jsonResult.status_code = 200;
                jsonResult.message = "เพิ่มข้อมูลเรียบร้อย";
                jsonResult.place = obj;
                res.json(jsonResult);
              }
          })
          .catch(function (error) { 
            jsonResult.status_code = 500;
            jsonResult.message = error.message;
            jsonResult.place = {};
            res.json(jsonResult);
          });


        })
        .catch(function (error) {
          jsonResult.status_code = 500;
          jsonResult.message = error.message;
          jsonResult.place = {};
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
  
  //if(place.isUpload){

    console.log("BEFORE UPLOADED"); 

    uploads(req, res, function (err) {
      const place = req.body; 
      const jsonResult = {}; 
      
      let editPlace = null;
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
        //   const fullPath = "http://"+hostname + "/place/"+ req.files[obj][0].originalname;
        //   //const fullPath = req.files[obj][0].originalname;
        //   if(index==0){
        //     fullPathStr = fullPath;
        //   }else{
        //     fullPathStr = fullPathStr + "," + fullPath; 
        //   }
   
        // }
  
        console.log("AFTER UPLOADED");
  
        if (place && id) {  
          place.image = place.newImage; 
          place.create_dttm = sequelize.fn('NOW'); 
          place.update_dttm = sequelize.fn('NOW'); 
          editPlace = sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            console.log("id0 = "+id);
            return Place.update(
              place, 
              { where: { id: id } },
              { transaction: t },
            );
          })
          .then(function (obj) {
            console.log("id1 = "+id); 
            Place.findOne({
              where: { id: id }, 
              attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
              include: [
                {
                  model:PlaceGroup,
                  attributes: [['id','group_id'], ['topic','group_topic']]
                }
              ]
            })
            .then(function (obj) {  
              console.log("id2"+obj);
              jsonResult.status_code = 200;
              jsonResult.message = "แก้ไขข้อมูลเรียบร้อย";
              jsonResult.place = obj;
              res.json(jsonResult);
            })
            .catch(function (error) { 
              jsonResult.status_code = 500;
              jsonResult.message = "แก้ไขข้อมูลสำเร็จเเต่ไม่สามารถ inquiry ข้อมูลออกมาได้";
              jsonResult.place = {};
              res.json(jsonResult);
            });

          })
          .catch(function (error) {
            jsonResult.status_code = 500;
            jsonResult.message = error.message;
            jsonResult.place = {};
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
  let placeDestroy = null;
  if (id) {
    const place = await Place.findByPk(id);
    if (place) {
      placeDestroy = await place.destroy()
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


// get with group id
route.get('/find/group_id/:group_id/:latitude/:longtitude', (req, res, next) => {

  console.log('body::==', req.body);
  console.log('params::==', req.params);

  const group_id = req.params.group_id;
  const latitude = req.params.latitude;
  const longtitude = req.params.longtitude;

  //set distance property
  distance.key(API_KEY);
  distance.units('metric');
  distance.mode('driving');
  distance.language('th');

  var jsonResult = {};

  PlaceGroup.hasMany(Place, {foreignKey: 'group_id'})
  Place.belongsTo(PlaceGroup, {foreignKey: 'group_id'})
  
  const placeList = Place.findAll(
    { 
    where:{group_id: group_id}, 
    attributes: ['id', 'topic', 'address', 'description1', 'description2', 'image', 'latitude', 'longtitude', 'author', 'create_dttm', 'update_dttm'],
    include: [
      {
        model:PlaceGroup,
        attributes: [['id','group_id'], ['topic','group_topic']]
      }
    ]
    }
    ).then(function (objList) {

      var origins = [latitude + "," + longtitude];
      //var origins = ['13.744950999999999,100.5622064'];
      var destinations = [];
      //var destinations = ['13.7993922,100.5465864','13.809500,100.570890', '13.7450547,100.561518'];

      objList.forEach(function (obj) { 
        //set destination
        const destination = obj.latitude + "," + obj.longtitude;
        destinations.push(destination);
      });

      distance.matrix(origins, destinations, async function (err, distances) {

        var dataList = [];

        if (err) {
          return console.log(err);
        }
        if (!distances) {
          return console.log('no distances');
        }
        if (distances.status == 'OK') {
          for (var i = 0; i < origins.length; i++) {
            for (var j = 0; j < destinations.length; j++) {
              var origin = distances.origin_addresses[i];
              var destination = distances.destination_addresses[j];
              var distance = "0.00";
              var duration = "0.00";
              if (distances.rows[0].elements[j].status == 'OK') {
                distance = distances.rows[i].elements[j].distance.value;
                duration = distances.rows[i].elements[j].duration.value;
                if (distance) {
                  distance = parseFloat(distance / 1000).toFixed(2);
                }

                if (duration) {
                  duration = parseFloat(duration / 60).toFixed(2);
                }
              } else {
                console.log(destination + ' is not reachable by land from ' + origin);
              }
              const target = objList[j].dataValues;
              const source = { distance: distance, distance_unit: 'กิโลเมตร', duration: duration, duration_unit: 'นาที' };
              //tranfer object target to source
              var returnedTarget = Object.assign(target, source);

              //set image string to array 
              var images = [];
              if(returnedTarget.image){
                images = returnedTarget.image.split(",");
              }   
              returnedTarget.image = images;   

              console.log("++++++++++++++++++++");
              console.log(returnedTarget);
              console.log("++++++++++++++++++++");

              dataList.push(returnedTarget);
            }

          }
 
          jsonResult.status_code = 200;
          jsonResult.message = "พบข้อมูล " + objList.length + " รายการ";
          jsonResult.place_list = dataList;
          res.json(jsonResult);

        }
 

      });



    })
    .catch(function (error) {
      jsonResult.status_code = 500;
      jsonResult.message = error.message;
      jsonResult.place_list = [];
      res.json(jsonResult);
    });
});



module.exports = route;