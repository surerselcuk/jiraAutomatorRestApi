var request = require('request');
var config = require('../bin/config');
var JiraClient = require('jira-connector');

var jira = new JiraClient( {
  host: config.jiraUrl,
  basic_auth: {
    username: config.jiraAdminUser,
    password: config.jiraAdminPass
  }
});


var jiraLogin = (userName, password) => {

  return new Promise((resolve,reject)=>{

    // This code sample uses the 'request' library:
// https://www.npmjs.com/package/request

    var bodyData = `{
  "username": "${userName}" ,
  "password": "${password}"
}`;


    var options = {
      method: 'POST',
      url: config.protocol+config.jiraUrl+'/rest/auth/1/session',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    };

    request(options, function (error, response, body) {
      if (error) reject(error);
      else resolve(response.statusCode);


    });


  }  );



};

var getUserInfo = (username) => {

 return new Promise ((resolve,reject)=>{

   jira.user.getUser({
     username:username
   }, function(error, data) {

     if(error) reject (error)
     else resolve (data);

   });

 });

}

var getJiraToken = () => {

  return new Promise((resolve,reject)=>{

    var bodyData = `{
  "username": "${config.jiraAdminUser}" ,
  "password": "${config.jiraAdminPass}"
}`;

    var options = {
      method: 'POST',
      url: config.protocol+config.jiraUrl+'/rest/auth/1/session',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    };



    request(options, function (error, response, body) {
      if (error)  reject(error);
      else {
        // console.log(response);
        resolve(JSON.parse(response.body).session.value);
      }

    });


  }  );



};

var isAdmin =  (username) => {


  var options = {
    method: 'GET',
    // url: 'https://itracktest.innova.com.tr/rest/api/3/member?groupname=jira-users',
    url: config.protocol+config.jiraUrl+'/rest/api/2/group?groupname='+config.jiraAdminGroup+'&expand=users',
    auth: { username: config.jiraAdminUserControlUser, password: config.jiraAdminUserControlPass},
    headers: {
      'Accept': 'application/json'
    }

  };


  return new Promise ((resolve,reject)=>{

    request(options, function (error, response, body) {
      if (error) reject(error);
      else {
        // for (let i of JSON.parse(body).users.items) { if(i.name.match(username)) resolve(true); }

      resolve(true);
      }
    });




  });




};



module.exports.jiraLogin = jiraLogin;
module.exports.getUserInfo = getUserInfo;
module.exports.getJiraToken = getJiraToken;
module.exports.isAdmin = isAdmin;


