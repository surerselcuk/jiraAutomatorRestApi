var config = {};

config.dbName='./public/db/db.db';                              //DbName with Directory Location

config.jiraDb = {                                               //Jira DB info
                user: 'dbUser',
                password: `dbPass`,
                server: 'server host or ip',
                database: 'jiraDbName',
                options: {
                  encrypt: true
                }
              };

config.appPort=3000;                                            //default port
config.projectName="Jira Automator Rest Api" ;                         //Project Name
config.version="1.0";                                           //Project Version
config.tokenKeyWord="kardelen";                                 //Keyword for Token
config.tokenExpireSecond=60*60*24*7;                            //Token expires is 7 days
config.scheduleHour = 5;                                        //Schedule daily start hour
config.scheduleMinute = 0;                                      //Schedule daily start minute


config.protocol="https://";                                     //Jira host protocol
config.jiraUrl='jira url';                      //Jira Server Url
config.jiraPort='';                                             //Jira host port
config.jiraAdminUser="adminUserName";                                  //Jira Admin username
config.jiraAdminPass="adminUserPass";                              //Jira Admin password
config.jiraAdminGroup="jira-administrators";




module.exports = config;
