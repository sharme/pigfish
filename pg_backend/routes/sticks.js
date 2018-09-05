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
   var addSQL = mysql.format("insert into jk_sticks(fs_id,u_id,st_create_time) values (?,?,?)",[req.body.fs_id, req.body.u_id,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {

            var addEvent = mysql.format("insert into jk_events(u_id,et_type,et_create_time) values (?,?,?)",[req.body.u_id, 'stick',date]);
            connection.query(addEvent);

            res.send(result);
        }
    })
});

router.post('/delete', function(req, res, next) {
    var addSQL = mysql.format("delete from jk_sticks where fs_id=? and u_id=?",[req.body.fs_id, req.body.u_id]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {

            // var addEvent = mysql.format("insert into jk_events(u_id,et_type,et_create_time) values (?,?,?)",[req.body.u_id, 'stick',date]);
            // connection.query(addEvent);

            res.send(result);
        }
    })
});


router.get('/getSticksByFSID', function(req, res, next) {
   var criteriaSQL = mysql.format("select (select u_avatar from jk_users as jku where jku.u_id = jks.u_id) as u_avatar, (select u_name from jk_users as jku where jku.u_id = jks.u_id) as u_name from jk_sticks as jks where jks.fs_id = ?",[req.param('fs_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/search', function(req, res, next) {
    var searchSQL = "select * from jk_sticks where 1=1 ";

    if(req.param('fs_id')) {
        searchSQL += " and fs_id =" + req.param('fs_id')
    }

    if(req.param('u_id')) {
        searchSQL += " and u_id =" + req.param('u_id');
    }
    
    connection.query(searchSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })

});






module.exports = router;
