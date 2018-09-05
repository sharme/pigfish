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

var date = new Date();

connection.connect();


router.post('/add', function(req, res, next) {
    
    var addSQL = mysql.format("insert into jk_tag_footsteps(tg_id,fs_id,tf_create_time) values (?,?,?)",[req.body.tg_id, req.body.fs_id,date]);
    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});


router.get('/getTags', function(req, res, next) {

    var sql = mysql.format("select tg_name from jk_tags  where tg_id in (select distinct tg_id from jk_tag_footsteps where fs_id=?);",[req.param('fs_id')]);
    console.log(sql);
    connection.query(sql, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            
            if(result){
                console.log(JSON.stringify(result));
            }
            
            res.send(JSON.stringify(result));
        }
    })
});



module.exports = router;
