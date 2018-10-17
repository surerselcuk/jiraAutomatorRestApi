const sql = require('mssql');
const getJiraToken = require ('../services/jiraLogin').getJiraToken;
const config = require('../bin/config');
const JiraClient = require('jira-connector');

const request = require('request');



let getFields =  (username,password) => {
  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: username,
      password: password
    }
  });

  return new Promise ((resolve,reject)=>{

    jira.field.getAllFields("",(err,data)=>{

      if(err) reject(err);
      else resolve(data);

    })

  });


};

let getAllProjects =  (username,password) => {

    var jira = new JiraClient( {
      host: config.jiraUrl,
      basic_auth: {
        username: username,
        password: password
      }
    });

    return new Promise ((resolve,reject)=>{

      jira.project.getAllProjects("",(err,data)=>{

        if(err) reject(err);
        else resolve(data);

      })

    });
};

let getIssueTypes =  (username,password) => {

  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: username,
      password: password
    }
  });

  return new Promise ((resolve,reject)=>{

    jira.issueType.getAllIssueTypes("",(err,data)=>{

      if(err) reject(err);
      else resolve(data);

    })

  });
};

let getFieldValues =  (username,password) => {
  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: username,
      password: password
    }
  });

  return new Promise ((resolve,reject)=>{

    jira.field.getCustomFieldOption({id: "customfield_13101" },(err,data)=>{

      if(err) reject(err);
      console.log(data);
      resolve(data);

    })

  });


};

let help =  (query) => { /////////////////////////

  return new Promise ((resolve,reject)=>{
    sql.connect(config.jiraDb, function (err) {
      if (err) reject(err);
      else {
        let request = new sql.Request();
        request.query(query, function (err, recordset) {
            if (err) reject(err);
            else {resolve(recordset.recordset);}

          });

      }
    });

  }); // promise end




};/////////////help end

let isAdmin =  (username) => {


  var options = {
    method: 'GET',
    // url: 'https://itracktest.innova.com.tr/rest/api/3/member?groupname=jira-users',
    url: config.protocol+config.jiraUrl+'/rest/api/2/group?groupname='+config.jiraAdminGroup+'&expand=users',
    auth: { username: "ssurer", password: "Kardelen12"},
    headers: {
      'Accept': 'application/json'
    }

  };


  return new Promise ((resolve,reject)=>{

    request(options, function (error, response, body) {
      if (error) reject(error);
      for (let i of JSON.parse(body).users.items) { if(i.name.match(username)) resolve(true); }
      reject(false);
    });




  });




};

// let userSearch =  (search) => {
//   var jira = new JiraClient( {
//     host: config.jiraUrl,
//     basic_auth: {
//       username: config.jiraAdminUser,
//       password: config.jiraAdminPass
//     }
//   });
//
//   return new Promise ((resolve,reject)=>{
//
//     jira.user.search({username: search },(err,data)=>{
//
//       if(err) reject(err);
//       else resolve(data);
//
//     })
//
//   });
//
//
// };

let userSearch =  (search, projectkey) => {
  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: config.jiraAdminUser,
      password: config.jiraAdminPass
    }
  });

  return new Promise ((resolve,reject)=>{

    jira.user.searchAssignable({username: search, project: projectkey },(err,data)=>{

      if(err) reject(err);
      else resolve(data);

    })

  });


};

let jiraDbSelect = (query)=> {
  return new Promise ((resolve,reject)=>{
    sql.connect(config.jiraDb, function (err) {
      if (err) {
        sql.close();
        reject(err);
      }
      else {
        let request = new sql.Request();
        request.query(query, function (err2, recordset) {
          if (err2) {
            sql.close();
            reject(err2);
          }
          else {resolve(recordset.recordset);
            sql.close();
          }

        });

      }
    });





  }); // promise end

};



module.exports.getFields = getFields;
module.exports.getIssueTypes = getIssueTypes;
module.exports.getAllProjects = getAllProjects;
module.exports.getFieldValues = getFieldValues;
module.exports.userSearch = userSearch;
module.exports.help = help;
module.exports.jiraDbSelect=jiraDbSelect;


