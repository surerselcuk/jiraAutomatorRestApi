var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var verifyToken = require('./middleware');
var daily = require ('./services/schedule').daily;
var schedule = require('node-schedule');
var config = require('./bin/config');



var indexRouter = require('./routes/index');
var restRouter = require('./routes/rest');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'html');

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,X-Request-With');
    next();
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter);
app.use('/rest', verifyToken); // rest için arakatmanı ekle.
app.use('/rest', restRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});





// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// schedule
// schedule.scheduleJob(`* ${config.scheduleHour} * * *`, function(){
var rule = new schedule.RecurrenceRule();
rule.hour = config.scheduleHour;
rule.minute = config.scheduleMinute;
schedule.scheduleJob(rule, function(){
    daily();
});

daily();

module.exports = app;
