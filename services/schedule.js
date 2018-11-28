var config = require('../bin/config');
const sqlite3 = require('sqlite3').verbose();
var dateTime = require('node-datetime');
var JiraClient = require('jira-connector');
var RRule = require('rrule').RRule;
var schedule = require('node-schedule');
var setLog = require('../services/core').setLog;




const db = new sqlite3.Database(config.dbName);



var newScheduleInsert = (form,username,issueInfo,schedules) => {
    let currentDate= dateTime.create(Date.now(),'d.m.Y H:M:S').format();
    let sql=`INSERT INTO schedule
              (project_name, project_key,issue_type_id, issue_type_name, summary, description,triger_type, week_triger_recur, week_triger_weekday
              , month_triger_month, month_triger_monthday, recorder, status, record_date, form_data, json_data,schedules,next_run_date,sc_description)
              Values('${form.project.name}','${form.project.key}','${form.issuetype.id}','${form.issuetype.name}','${form.summary}'
              ,'${form.description}','${form.triger.trigerType}','${form.triger.weekTriger.recur}','${form.triger.weekTriger.weekDay}',
              '${form.triger.monthTriger.month}','${form.triger.monthTriger.monthDay}','${username}','planned','${currentDate}'
               ,'${JSON.stringify(form)}', '${issueInfo}' , '${JSON.stringify(schedules.splice(1))}', '${schedules[0]}','${form.sc_description}')`;


    return new Promise((resolve,reject)=> {

                db.exec(sql, (err) => {
                  if (err == null ) resolve();
                else  reject(err);
                });

    });

}

var createIssue =  (issueInfo) => {

  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: config.jiraAdminUser,
      password: config.jiraAdminPass
    }
  });

  return new Promise ((resolve,reject)=>{


    jira.issue.createIssue(issueInfo,(err,data)=>{

      if(err) {
        setLog(null,"createIssue","system","fail",JSON.stringify(err));
        reject(err); }
      else {
        resolve (data);
      }


    })

  });


};

var deleteIssue =  (issueKey) => {
  var jira = new JiraClient( {
    host: config.jiraUrl,
    basic_auth: {
      username: config.jiraAdminUser,
      password: config.jiraAdminPass
    }
  });

  return new Promise ((resolve,reject)=>{


    jira.issue.deleteIssue({issueKey:issueKey},(err,data)=>{

      if(err) reject(err);
      resolve (data);


    })

  });


};

var scheduleSet = (trigerType,weekRecur,weekDay,month,monthDay,callback)=>{

  if (trigerType==='week') {
      const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: weekRecur,
      byweekday: weekDay,
      dtstart: new Date(Date.now()),
      until: new Date(Date.now()+1000*60*60*24*365*20),
      });
      return callback(rule.all());

  }
  else if (trigerType==='month') {
      const rule = new RRule({
        freq: RRule.MONTHLY,
        bymonth: month,
        bymonthday: monthDay,


        dtstart: new Date(Date.now()),
        until: new Date(Date.now()+1000*60*60*24*365*20),
      });

      return callback(rule.all());

  }
  else {
    const rule = new RRule({
      freq: RRule.DAILY,
      byweekday: [0,1,2,3,4],
      dtstart: new Date(Date.now()+1000*60*60*24),
      until: new Date(Date.now()+1000*60*60*24*365*20),
    });
    return callback(rule.all());

  }




  }

var daily = ()=>{

  let currentDate = dateTime.create(Date.now(),'d.m.Y').format();
  let currentDateTime = dateTime.create(Date.now(),'d.m.Y H:M:S').format();

  //log
  db.exec(`insert into logs (subject,date,user,status,log) Values('job','${currentDateTime}','system','success','Daily Job is start'  )`);

  let sql=`select * from schedule  where is_deleted='false' and next_run_date='${currentDate}'   `;


  db.each(sql,(err,rows)=>{

    createIssue(JSON.parse(rows.json_data)).then(data=>{
      db.exec(`update schedule set status='success', last_run_date='${currentDate}', next_run_date='${JSON.parse(rows.schedules)[0]}', schedules='${JSON.stringify(JSON.parse(rows.schedules).splice(1))}' where id=${rows.id}`);
      db.exec(`insert into logs (subject_id,subject,date,user,status,log) Values('${rows.id}','Auto Issue Create','${currentDateTime}','${config.jiraAdminUser}','success','${JSON.stringify(data)}'  )`);
    }).catch(err=>{
      db.exec(`update schedule set status='fail', last_run_date='${currentDate}', next_run_date='${JSON.parse(rows.schedules)[0]}', schedules='${JSON.stringify(JSON.parse(rows.schedules).splice(1))}' where id=${rows.id}`);
      //db.exec(`update schedule set status='fail', last_run_date='${currentDate}' where id=${rows.id}`);
      db.exec(`insert into logs (subject_id,subject,date,user,status,log) Values('${rows.id}','Auto Issue Create','${currentDateTime}','${config.jiraAdminUser}','fail','${JSON.stringify(err)}'  )`);
    });

  })


}

var getSchedules =  (username,isAdmin) => {

  let select= "id,project_name,project_key,issue_type_name,summary,description,triger_type,week_triger_recur,week_triger_weekday,month_triger_month,month_triger_monthday,recorder,record_date,status,form_data,last_run_date,next_run_date, sc_description";
  let sql = isAdmin==='true' ?  `select ${select} from schedule where is_deleted='false' order by id desc ` : `select ${select} from schedule where is_deleted='false' and recorder='${username}'order by id desc`;

  return new Promise ((resolve,reject)=>{
    db.all(sql,(err,data)=>{
      if(err) reject(err);
      resolve(data);
    })

  });

};

var deleteSchedule =  (id) => {




  return new Promise ((resolve,reject)=>{

    db.run("Update schedule set is_deleted='true' WHERE rowid=?", id, function(err) {
      if (err) {
        reject (err);
        return console.error(err);
      }

      resolve("delete succeded");
    });



  });

};






module.exports.newScheduleInsert = newScheduleInsert;
module.exports.createIssue = createIssue;
module.exports.scheduleSet = scheduleSet;
module.exports.deleteIssue = deleteIssue;
module.exports.daily = daily;
module.exports.getSchedules = getSchedules;
module.exports.deleteSchedule = deleteSchedule;

