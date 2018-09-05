var express = require('express');
var router = express.Router();
var auth = require('./auth.js');
var requestIp = require('request-ip');
var mysql = require('mysql');
var helper = require('./helper.js');
var bodyParser = require('body-parser');
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

// public API

router.get('/getUsers', function(req, res, next) {
  
  if(req.param('secret') == auth.encrypt('qwertyuiop')) {
    connection.query('select * from jk_users', function (err, rows, fields) {
      if (err) {
        res.send(err);
      } else {
        console.log('Username is: ' + rows[0].u_name);
        // connection.end();
        res.send(rows);
      }
    });
  }
});

router.get('/getUserById', function(req, res, next) {
  
  if(req.param('secret') == auth.encrypt(req.param('u_id'))) {

    var criteriaSQL = mysql.format('select * from jk_users where u_id = ?', req.param('u_id'));
    connection.query(criteriaSQL, function (err, rows, fields) {
      if (err) {
        res.send(err);
      } else {
        res.send(rows);
      }
    });
  } else {
    res.send('access denied, please contact administrator.');
  }
  
});

router.get('/getUserDetail', function(req, res, next) {
  
  if (req.param('secret') == auth.encrypt(req.param('u_id'))) {
    var criteriaSQL = mysql.format("select u_id," +
        " u_name,(select count(*) from jk_footsteps as jkf where jkf.u_id = jku.u_id) as footsteps," +
        "(select count(*) from jk_sticks as jks where jks.u_id = jku.u_id) as sticks," +
        "(select count(*) from jk_followers as jkf where jkf.fl_fl_id = jku.u_id) as follows," +
        "(select count(*) from jk_followers as jkf where jkf.u_id = jku.u_id) as fans from jk_users as jku where jku.u_id = ?", [req.param('u_id')]);

    connection.query(criteriaSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  } else {
    res.send('access denied, please contact administrator.');
  }

});

router.post('/update', urlencodeParser, function(req, res, next) {

  if(req.body.secret == auth.encrypt(req.body.u_id.toString())) {

    var updateSQL = mysql.format("update jk_users set u_name = ?, u_avatar = ?, u_link = ?, u_slogan = ? where u_id = ?", [req.body.u_name, req.body.u_avatar, req.body.u_link, req.body.u_slogan, req.body.u_id]);
    connection.query(updateSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  } else {
    res.send({errno: 1001, code: 'access denied'});
  }

});

router.get('/follow', function(req, res, next) {

  if(req.param('secret') == auth.encrypt(req.param('u_id'))) {

    var followSQL = mysql.format("select u_id,u_name,u_avatar,u_link from jk_users as jku where jku.u_id in (select u_id from jk_followers as jkf where jkf.fl_fl_id = ?)", [req.param('u_id')]);
    connection.query(followSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })
  } else {
    res.send("access denied, please contact administrator.");
  }

});

router.get('/followers', function(req, res, next) {

  if(req.param('secret') == auth.encrypt(req.param('u_id'))) {

    var followerSQL = mysql.format("select u_id,u_name,u_avatar,u_link from jk_users as jku where jku.u_id in (select fl_fl_id from jk_followers as jkf where jkf.u_id = ?)", [req.param('u_id')]);
    connection.query(followerSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    })
  } else {
    res.send("access denied, please contact administrator.");
  }
});




// API for registered by phone.

router.post('/create', urlencodeParser, function(req, res, next) {
  
  var createSQL = "insert into jk_users(u_phone_num,u_pwd,u_name,u_status,u_link,u_create_time,u_update_time) values (?,?,?,1,?,?,?)";
  var inserts = [req.body.phoneNumber, req.body.password, req.body.username,"www.buybs.com/"+ req.body.username,date,date];
  createSQL = mysql.format(createSQL, inserts);
  console.log(createSQL);
  connection.query(createSQL, function (err, result) {
    if(err) {
      res.send(err);
    } else {

      connection.query("select u_id from jk_users where u_phone_num='"+ req.body.phoneNumber + "';", function(err, result){
        if(result.length > 0)
          helper.initializationPicFolder(result[0].u_id);
      });

      res.send(result);
    }
  });
  
});

router.post('/login', urlencodeParser, function(req,res, next) {

  var criteriaSQL = mysql.format("select * from jk_users where u_phone_num = ? and u_pwd = ?",[req.body.phoneNumber, req.body.password]);
  connection.query(criteriaSQL, function(err, result) {
    if(err) {
      res.send(err);
    } else {
      if (result.length > 0) {
        var log = "用户: " + result[0].u_id + " 登录成功.";
        var ipAddress = requestIp.getClientIp(req);
        var insertLog = mysql.format("insert into jk_logs(lg_content,lg_ip,lg_create_time) values(?,?,?)", [log, ipAddress, date]);
        connection.query(insertLog, function (err, result) {
          console.log(insertLog);
          if (err)
            console.log(err);
          else
            console.log(result);
        });

        // update u_last_login time
        var updateLoginTime = mysql.format("update jk_users set u_update_time = ? where u_phone_num = ?", [date, req.body.phoneNumber]);
        connection.query(updateLoginTime, function (err, result) {
          console.log(updateLoginTime);
          if (err)
            console.log(err);
          else
            console.log(result);
        });


        res.send([{
          u_id: result[0].u_id,
          u_avatar: result[0].u_avatar,
          u_name: result[0].u_name,
          secret: auth.encrypt(result[0].u_id.toString())
        }]);
      } else {
        res.send(result);
      }
    }
  });
});

router.post('/updatePwd', urlencodeParser, function(req, res, next) {

  if(req.body.secret == auth.encrypt(req.body.phoneNumber)) {
    var updateSQL = mysql.format("update jk_users set u_pwd = ? where u_phone_num = ? ",[req.body.password, req.body.phoneNumber]);
    connection.query(updateSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  } else {
    res.send({errno: 1003, code:'access denied, please contact administrator.'});
  }

});



// API for registered by email.


router.post('/email', function (req, res, next) {

  connection.query("select u_id from jk_users where u_email='"+ req.body.u_email + "';", function(err, result){
    if(result.length > 0)
      res.send({errno: 1002, code:'ER_DUP_ENTRY'});
      return;
  });


  var u_email = req.body.u_email;
  if(req.body.u_email && req.body.u_pwd) {
    res.mailer.send('email', {
      to: u_email,
      subject: '欢迎加入有图',
      link: 'http://www.fmyoutu.com/users/email_verify?email=' + u_email+"&secret=" + auth.encrypt(u_email) ,
      otherProperty: 'Other Property'
    }, function (err) {
      if (err) {
        res.send(err);
        return;
      } else {
        var createSQL = "insert into jk_users(u_phone_num,u_pwd,u_name,u_status,u_link,u_create_time,u_update_time,u_email) values (?,?,?,1,?,?,?,?)";
        var inserts = [null, req.body.u_pwd, req.body.u_name, "www.fmyoutu.com/" + req.body.u_name, date, date, req.body.u_email];
        createSQL = mysql.format(createSQL, inserts);
        console.log(createSQL);
        connection.query(createSQL, function (err, result) {
          if (err) {
            res.send(err);
          } else {

            connection.query("select u_id from jk_users where u_email='"+ req.body.u_email + "';", function(err, result){
              if(result.length > 0)
                helper.initializationPicFolder(result[0].u_id);
            });

            res.send(result);
          }
        });
      }
      
    });
  } else {
    res.send({errno: 1001, code:'illegal request.'});
  }
  
});

router.get('/email_verify', function(req, res, next) {

  if(req.param('secret') == auth.encrypt(req.param('email'))) {
    // u_status: 0 verified, 1: verify, 2: fraud
    var followSQL = mysql.format("update jk_users set u_status=0 where u_email=?", [req.param('email')]);
    console.log(followSQL);
    connection.query(followSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send("<div style='padding: 20px;'>验证成功, <a href='http://www.fmyoutu.com/#/email_login'>点击登陆<a/></div>");
      }
    })
  } else {
    res.send({errno: 1003, code:'access denied, please contact administrator.'});
  }

});

router.post('/email_login', urlencodeParser, function(req,res, next) {

  // u_status = 0. the email has been activated.
  var criteriaSQL = mysql.format("select * from jk_users where u_email = ? and u_pwd = ?",[req.body.u_email, req.body.u_pwd]);
  connection.query(criteriaSQL, function(err, result) {
    if(err) {
      res.send(err);
      return;
    } else {
      if(result.length > 0) {
        
        if(result[0].u_status === 1){
          res.send({errno: 1003, code: 'email has not been activated.'});
          return;
        }
        
        var log = "用户: " + result[0].u_id + " 登录成功.";
        var ipAddress = requestIp.getClientIp(req);
        var insertLog = mysql.format("insert into jk_logs(lg_content,lg_ip,lg_create_time) values(?,?,?)", [log, ipAddress, date]);
        connection.query(insertLog, function (err, result) {
          console.log(insertLog);
          if (err)
            console.log(err);
          else
            console.log(result);
        });

        // update u_last_login time
        var updateLoginTime = mysql.format("update jk_users set u_update_time = ? where u_email = ?", [date, req.body.u_email]);
        connection.query(updateLoginTime, function (err, result) {
          console.log(updateLoginTime);
          if (err)
            console.log(err);
          else
            console.log(result);
        });
        
        res.send([{
          u_id: result[0].u_id,
          u_avatar: result[0].u_avatar,
          u_name: result[0].u_name,
          secret: auth.encrypt(result[0].u_id.toString())
        }]);
      } else {
        res.send(result);
      }
    }
  });
});

router.post('/email_recovery', urlencodeParser, function(req,res, next) {

  var u_email = req.body.u_email;
  if(req.body.u_email) {
    res.mailer.send('recovery', {
      to: u_email,
      subject: '重置密码',
      link: 'http://www.fmyoutu.com/#/email_reset?u_email=' + u_email+"&secret=" + auth.encrypt(u_email) ,
      otherProperty: 'Other Property'
    }, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send({code:'operation success.'})
      }
    });
  } else {
    res.send({errno: 1001, code:'illegal request.'});
  }
  
});

router.post('/email_reset', urlencodeParser, function(req,res, next) {
  
  if(req.body.secret == auth.encrypt(req.body.u_email)) {

    var criteriaSQL = mysql.format("update jk_users set u_pwd = ? where u_email = ?", [req.body.u_pwd, req.body.u_email]);
    connection.query(criteriaSQL, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  } else {
    res.send({errno: 1001, code: 'access denied'});
  }
  
});



module.exports = router;
