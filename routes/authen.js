// import lib
const express = require('express'); 
const route = express.Router();
 
const user = {
  id: 1,
  username: 'admin',
  email: 'admin@doe.com',
  name: 'Admin Candle'
};

route.get('/me', (req, res, next) => {
  return res.json({
    data: {
      user
    }
  });
});

route.post('/login', async (req, res, next) => { 
  const { username, password } = req.body;
  const jsonResult = {};
  // query db. inmemory
  if (username === 'admin' && password === 'admin') {
    console.log("LOGIN SUCCESS");
    return res.json({
      data: {
        user,
        token: 'THIS_IS_TOKEN'
      }
    });
  } else {
    console.log("LOGIN FAIL");
    return res.status(401).json({
      message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
    });
  } 
});

module.exports = route;