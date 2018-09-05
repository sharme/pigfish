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
    var addSQL = mysql.format("insert into jk_comments(fs_id,u_id,cm_content,cm_create_time) values (?,?,?,?)",[req.body.fs_id, req.body.u_id,req.body.cm_content,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});


router.get('/getCommentsByFSID', function (req, res, next) {
   var criteriaSQL = mysql.format("select (select u_avatar from jk_users as jku where jku.u_id = jkc.u_id) as u_avatar, (select u_name from jk_users as jku where jku.u_id = jkc.u_id) as u_name, cm_content, cm_create_time from jk_comments as jkc where jkc.fs_id = ?", [req.param('fs_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});







module.exports = router;
