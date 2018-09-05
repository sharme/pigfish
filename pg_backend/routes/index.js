var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var moment = require('moment');
var geoip = require('geoip-lite');
// Create application/x-www-form-urlencoded parser
var urlencodeParser = bodyParser.urlencoded( { extended: false });

var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'fm@youtumi',
  database: 'pigfish'
});

connection.connect();

var date = new Date();

/* GET home page. */
var approve;
router.get('/index', function(req, res, next) {

  var secret = req.param("secret");
  if(secret == '123456qwertyuiop') {
    var sql = "select fs_id, fs_status, fs_smallImg, fs_disPic, fs_des, fs_from,(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as createBy, fs_create_time from jk_footsteps as jkf order by jkf.fs_create_time desc;";
    // var sql = "select fs_id, fs_status, fs_smallImg, fs_des, fs_from, fs_create_time from jk_footsteps order by fs_create_time desc;";
    connection.query(sql, function (err, result) {
      approve = result;
      res.render('index', {title: '有图后台', result: approve, moment: moment});
    });
  } else {
    res.render('error');
  }
});

router.get('/redirect', function(req, res, next) {

  console.log("redirect log");
  res.redirect("http://modeng.ke.qq.com/");
  res.end();

});

router.get('/logs', function(req, res, next) {

  var secret = req.param("secret");
  if(secret == '123456qwertyuiop') {
    var sql = "select lg_id, lg_content,lg_ip, lg_create_time from jk_logs order by lg_id desc;";
    connection.query(sql, function (err, result) {
      approve = result;
      res.render('logs', {title: '有图后台', result: approve, moment: moment, geoip: geoip});
    });
  } else {
    res.render('error');
  }

});

router.get('/home', function(req, res, next) {
  res.render('home', {title: '有图后台'});
});

var tags;
router.get('/tags', function(req, res, next) {

  var secret = req.param("secret");
  if(secret == '123456qwertyuiop') {
    var sql = "select fs_id, fs_status,fs_smallImg, fs_des, fs_disPic, fs_from, fs_create_time from jk_footsteps where fs_status=1 order by fs_create_time";
    connection.query(sql, function (err, result) {
      approve = result;
      // console.log(result);
    });

    var tagSql = "select tg_id, tg_name from jk_tags;";
    connection.query(tagSql, function (err, result) {
      tags = result;
      res.render('tags', {title: '有图后台', result: approve, tags: tags, moment: moment});
    });

  } else {
    res.render('error');
  }

});




router.get('/email', function (req, res, next) {

  var u_email = req.param('u_email');


    res.mailer.send('email', {
      to: u_email,
      subject: '欢迎加入有图', // REQUIRED.
      link: 'http://180.76.152.112/email/verify?code=qweuoqrwqqe234s2342',
      otherProperty: 'Other Property'
    }, function (err) {
      if (err) {
        // handle error
        console.log(err);
        //There was an error sending the email
        res.send(01);
        return;
      }
      res.send(00);
    });
});


module.exports = router;
