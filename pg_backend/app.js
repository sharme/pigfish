var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var footsteps = require('./routes/footsteps');
var countries = require('./routes/countries');
var sticks = require('./routes/sticks');
var likes = require('./routes/likes');
var comments = require('./routes/comments');
var followers = require('./routes/followers');
var api = require('./routes/api');
var pic = require('./routes/picture');
var messages = require('./routes/messages');
var topics = require('./routes/topics');
var topicLikes = require('./routes/topicLikes');
var topicComments = require('./routes/topicComments');
var topicClicks = require('./routes/topicClicks');
var notifications = require('./routes/notifications');
var pictureApprove = require('./routes/pictureApprove');
var pictures = require('./routes/pictures');
var tagFootsteps = require('./routes/tagFootsteps');

var app = express();
var mailer = require('express-mailer');
mailer.extend(app, {
  from: 'fmyoutu@fmyoutu.com',
  host: 'smtp.mxhichina.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'fmyoutu@fmyoutu.com',
    pass: '123QWEqwe'
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/backend', routes);
app.use('/users', users);
app.use('/footsteps', footsteps);
app.use('/countries', countries);
app.use('/sticks', sticks);
app.use('/likes', likes);
app.use('/comments', comments);
app.use('/followers', followers);
app.use('/api', api);
app.use('/pic', pic);
app.use('/messages', messages);
app.use('/topics', topics);
app.use('/topicLikes', topicLikes);
app.use('/topicComments', topicComments);
app.use('/topicClicks', topicClicks);
app.use('/notifications', notifications);
app.use('/pictureApprove', pictureApprove);
app.use('/pictures', pictures);
app.use('/tagFootsteps', tagFootsteps);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
