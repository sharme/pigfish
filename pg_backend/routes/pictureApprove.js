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

router.post('/reject', function(req, res, next) {
    var addSQL = mysql.format("update jk_footsteps set fs_status=-1,fs_update_time=? where fs_id=?",[date, req.param('fs_id')]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.post('/approve', function(req, res, next) {
    var addSQL = mysql.format("update jk_footsteps set fs_status=1,fs_update_time=? where fs_id=?",[date, req.param('fs_id')]);

    console.log(addSQL);
    
    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});


router.post('/delete', function(req, res, next) {
    var addSQL = mysql.format("delete from jk_footsteps where fs_id=?",[req.param('fs_id')]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});


router.get('/getApprovePictures', function(req, res, next) {
    var sql = "select fs_id, fs_status,fs_smallImg , fs_des, fs_from, fs_create_time from jk_footsteps where fs_status=0";

    connection.query(sql, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })

});






module.exports = router;
