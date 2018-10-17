var express = require('express');
var router = express.Router();
var config = require('../bin/config');
var jwt = require('jsonwebtoken');
var jiraLogin = require ('../services/jiraLogin').jiraLogin;
var isAdmin = require ('../services/jiraLogin').isAdmin;
var getUserInfo = require ('../services/jiraLogin').getUserInfo;
var setLog = require('../services/core').setLog;

global.sayi=2;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: config.projectName });

});



// login route
router.post('/login', function(req, res, next) {

  // Request body has username and password?
  const {username, password} = req.body;
  if (!username || !password) res.json({status: false, message: 'Authentication Failed'});

  //Go to jiraLogin Service and Login verify
  jiraLogin(username, password)
    .then(data => {

      if(data===200) {  // if code 200 means Login is success.


        isAdmin(username).then(isAdmin=>{
          getUserInfo(username).then(userData=>{
            response={status: true,
              token: jwt.sign(    {
                exp: Math.floor(Date.now() / 1000) + config.tokenExpireSecond ,  // token expires (for change go to config file)
                data: password
              },config.tokenKeyWord    ),
              userinfo:userData,
              isAdmin: isAdmin
            };

            res.json(response);
            setLog(null,'login',username,'success','Login is succeded.');

          });

        })





      }
      else {
        response={status: false, message:"Jira username or password is wrong! Please try again."};
        if (data===404) response={status: false, message:`Can not access Jira Server =>(${config.protocol+config.jiraUrl}) \r Please contact your jira administrator! `};
        res.json(response);
        setLog(null,'login',username,'fail',JSON.stringify(response));
      }

    })
    .catch(error=>{
      console.log(error);
      res.json({status: false, message:`Can not access Jira Server =>(${config.protocol+config.jiraUrl}) \r Please contact your jira administrator! `});
    });

});








module.exports = router;

