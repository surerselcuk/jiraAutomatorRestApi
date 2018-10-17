
var config = require('../bin/config');
const sqlite3 = require('sqlite3');
var dateTime = require('node-datetime');
const db = new sqlite3.Database(config.dbName);




var getLogs =  () => {

  return new Promise ((resolve,reject)=>{
  db.all('select * from logs order by id desc',(err,data)=>{
    if(err) reject(err);
    else resolve(data);
  })

  });

};

// var getLogs =  () => {
//
//   return new Promise ((resolve,reject)=>{
//     db.all('select * from logs order by id desc',(err,data)=>{
//       if(err) reject(err);
//       resolve(data);
//     })
//
//   });
//
// };

var setLog = (subject_id,subject,user,status,log)=>{

  let currentDateTime = dateTime.create(Date.now(),'d.m.Y H:M:S').format();

  //log
  db.exec(`insert into logs (subject_id,subject,date,user,status,log) Values('${subject_id}','${subject}','${currentDateTime}','${user}','${status}','${log}'  )`);

}

var selectQuery =  (query) => {

  return new Promise ((resolve,reject)=>{
    db.all(query,(err,data)=>{
      if(err) reject(err);
      else resolve(data);
    })

  });

};



module.exports.getLogs = getLogs;
module.exports.setLog = setLog;
module.exports.selectQuery = selectQuery;


