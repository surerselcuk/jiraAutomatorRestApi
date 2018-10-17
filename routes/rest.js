var express = require('express');
var router = express.Router();
var config = require('../bin/config');
var dateTime = require('node-datetime');

var JiraClient = require('jira-connector');
var request = require('request');
var getJiraToken = require ('../services/jiraLogin').getJiraToken;
var isAdmin = require ('../services/jiraLogin').isAdmin;
var getAllProjects = require ('../services/jiraInfo').getAllProjects;
var getIssueTypes = require ('../services/jiraInfo').getIssueTypes;
var getFields = require ('../services/jiraInfo').getFields;
var getFieldValues = require ('../services/jiraInfo').getFieldValues;
var newScheduleInsert = require ('../services/schedule').newScheduleInsert;
var createIssue = require ('../services/schedule').createIssue;
var help = require ('../services/jiraInfo').help;
var userSearch = require ('../services/jiraInfo').userSearch;
var scheduleSet = require ('../services/schedule').scheduleSet;
var deleteIssue = require ('../services/schedule').deleteIssue;
var daily = require ('../services/schedule').daily;
var schedule = require('node-schedule');
var getLogs = require('../services/core').getLogs;
var setLog = require('../services/core').setLog;
var getSchedules = require ('../services/schedule').getSchedules;
var deleteSchedule = require ('../services/schedule').deleteSchedule;
var selectQuery = require('../services/core').selectQuery;
var jiraDbSelect = require ('../services/jiraInfo').jiraDbSelect;




router.all('/help', function(req, res, next) {

jiraDbSelect(query).then(data=>res.json(data));



// getJiraToken().then(data=>res.json(data));




});


// getLogs
router.post('/getlogs', function(req, res, next) {


  getLogs().then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));


});

// jiraquery
router.post('/jquery', function(req, res, next) {

  const {jquery} = req.body;
  if (!jquery) res.json({status: false, message: 'jquery parameters is required!'});

  jiraDbSelect(jquery).then((data)=>{res.json(data)})
    .catch((err)=>res.json({status: false, message: err}));

});

// squery
router.post('/squery', function(req, res, next) {

  const {squery} = req.body;
  if (!squery) res.json({status: false, message: 'squery parameters is required!'});

  selectQuery(squery).then((data)=>{res.json({status: true, results: data});})
    .catch((err)=>res.json({status: false, message: err}));

});

// getSchedules
router.post('/getsc', function(req, res, next) {

  const {username, isAdmin} = req.body;
  if (!username) res.json({status: false, message: 'Username and isAdmin parameters is required!'});

  getSchedules(username, isAdmin).then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));


});

// delsc
router.post('/delsc', function(req, res, next) {

  const {id,username} = req.body;
  if (!id || !username) res.json({status: false, message: 'Schedule and Username Id is required!'});

  deleteSchedule(id).then((data)=>{res.json({status: true, message: data})})
    .catch((err)=>res.json({status: false, messages: err}));
  setLog(id,'issue schedule deleted',username,'success',`schedule id=>${id} deleted! `);

});

// newschedule
router.post('/newschedule', function(req, res, next) {

  const {username, password, form} = req.body;
  if (!username || !password) res.json({status: false, message: 'Authentication Failed'});

  scheduleList =  scheduleSet(form.triger.trigerType,form.triger.weekTriger.recur,form.triger.weekTriger.weekDay,form.triger.monthTriger.month,form.triger.monthTriger.monthDay, (data)=>{
    let scheduleList = [];
    for(let i of data)    scheduleList.push(dateTime.create(i,'d.m.Y').format());
    return scheduleList;
  });


  let fields ="";
  for(let i of form.dynamicFields){



    if (Object.keys(i)[0]==="components") {
      fields += `,"components" :  [{"name": "${i[Object.keys(i)[0]]}"}] `

    }
    else {
      fields += `,"${Object.keys(i)[0]}" : {"value": "${i[Object.keys(i)[0]]}"} `
    }



  }

  if (form.description.length>0) {
    fields +=`,"description": "${form.description}"`;
  }
  if (form.summary.length>0) {
    fields +=`,"summary": "${form.summary}"`;
  }
  if (form.assignee) {
    fields +=`,"assignee": {"name":"${form.assignee.name}"}`;

  }

  let issueInfo= `{"fields": { "project": {"key": "${form.project.key}"}, "issuetype": {"name": "${form.issuetype.name}"} ${fields} }}`;

  createIssue(JSON.parse(issueInfo)).then(data=>{

    newScheduleInsert(form,username,issueInfo,scheduleList).then( data2 => {
      deleteIssue(data.key).then(data_delete=>setLog(null,'issue deleted','system','success',`${data.key} => Issue is deleted. Because it is test issue for new schedule`)).catch(err=>setLog(null,'issue undeleted','system','fail',`${data.key} => Issue is not delete. It must delete!`));
      res.json({status:true, messages: "Success", testissuekey: data.key});
      setLog(null,'new issue schedule',username,'success',issueInfo);
    })
      .catch ( err => {res.json({status: false, messages: err});
        console.log(err)} );

  }).catch(err=>res.json({status: false, messages: err.errors}));


});

// getissuetypes
router.post('/getissuetypes', function(req, res, next) {

  const {username, password} = req.body;
  if (!username || !password) res.json({status: false, message: 'Authentication Failed'});

  getIssueTypes(username,password).then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));


});

//getallprojects
router.post('/getallprojects', function(req, res, next) {
  const {username, password} = req.body;
  if (!username || !password) res.json({status: false, message: 'Authentication Failed'});

  getAllProjects(username,password).then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));

});

//getallfields
router.post('/getallfields', function(req, res, next) {
  const {username, password} = req.body;
  if (!username || !password) res.json({status: false, message: 'Authentication Failed'});

  getFields(username,password).then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));

});

// usersearch
router.post('/usersearch', function(req, res, next) {

  const {search,projectkey} = req.body;

  userSearch(search,projectkey).then((data)=>{res.json(data)})
    .catch((err)=>res.json(err));


});

// verifyToken
router.post('/verifytoken', function(req, res, next) {

  res.json({status: true, message: 'Token is verify'})


});

module.exports = router;
