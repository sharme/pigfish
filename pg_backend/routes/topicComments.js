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
    
    console.log("comment: " + req.body.tp_cm_content);
    
    var addSQL = mysql.format("insert into jk_topics_comments(tp_id,u_id,tp_cm_to,tp_cm_content,tp_cm_create_time) values (?,?,?,?,?)",[req.body.tp_id, req.body.u_id,req.body.tp_cm_to,req.body.tp_cm_content,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});


router.get('/getCommentsByTPID', function (req, res, next) {
    var criteriaSQL = mysql.format("select (select u_avatar from jk_users as jku where jku.u_id = jktc.u_id) as u_avatar, (select u_name from jk_users as jku where jku.u_id = jktc.u_id) as u_name, tp_cm_content, tp_cm_create_time from jk_topics_comments as jktc where jktc.tp_id = ?", [req.param('tp_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/search', function (req, res, next) {
    var criteriaSQL = mysql.format("select count(*) as comments from jk_topics_comments as jktc where jktc.tp_id = ?", [req.param('tp_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});







module.exports = router;
