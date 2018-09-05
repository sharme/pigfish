var express = require('express');
var router = express.Router();
var mysql = require('mysql');
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

router.post('/add', function(req, res, next) {
    var addSQL = mysql.format("insert into jk_followers(u_id,fl_fl_id,fl_create_time,fl_update_time) values (?,?,?,?)",[req.body.u_id, req.body.fl_fl_id,date,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {

            var addEvent = mysql.format("insert into jk_events(u_id,et_type,et_create_time) values (?,?,now())",[req.body.u_id, 'follow']);
            connection.query(addEvent);
            
            res.send(result);
        }
    })
});

router.post('/unfollow', function(req, res, next) {
    var addSQL = mysql.format("delete from jk_followers where u_id = ? and fl_fl_id = ?",[req.body.u_id, req.body.fl_fl_id]);

    console.log(addSQL);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {

            var addEvent = mysql.format("insert into jk_events(u_id,et_type,et_create_time) values (?,?,now())",[req.body.u_id, 'unfollow']);
            connection.query(addEvent);

            res.send(result);
        }
    })
});


router.get('/getFollowsByUID', function(req, res, next) {
    var criteriaSQL = mysql.format("select" +
        " (select u_avatar from jk_users as jku where jku.u_id =jkf.u_id ) as u_avatar," +
        " (select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_name" +
        " from jk_followers as jkf where jkf.fl_fl_id = ?;",[req.param('u_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFollowCheck', function(req, res, next) {
    var criteriaSQL = mysql.format("select * from jk_followers where u_id=? and fl_fl_id=?",[req.param('u_id'), req.param('fl_fl_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFansByUID', function(req, res, next) {
    var criteriaSQL = mysql.format("select" +
        " (select u_avatar from jk_users as jku where jku.u_id =jkf.fl_fl_id ) as u_avatar," +
        " (select u_name from jk_users as jku where jku.u_id=jkf.fl_fl_id) as u_name" +
        " from jk_followers as jkf where jkf.u_id = ?;",[req.param('u_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});







module.exports = router;
