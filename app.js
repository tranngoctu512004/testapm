var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const apm = require('elastic-apm-node').start({
  serviceName: 'testapm',
  secretToken: 'AWLf6qy9QL23wl50orHZmg',
  serverUrl: 'http://103.116.52.168:8200',
  environment: 'development',
  captureBody: 'all',
  captureHeaders: true,
  transactionSampleRate: 1.0,
  captureSpanStackTraces: true,
  stackTraceLimit: 50, // 
  errorOnAbortedRequests: true, //  HTTP bị hủy là lỗi
  centralConfig: true, // cấu hình apm sever
  // ignoreUrls: ['/healthcheck', '/status'],
  // ignoreUserAgents: ['curl', 'Pingdom']
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  apm.captureError(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//connect database 
mongoose.connect('mongodb://root:512004@103.116.52.168:27017')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    apm.captureError(err);
  });
module.exports = app;


