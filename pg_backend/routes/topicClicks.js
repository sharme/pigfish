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

var date =new Date();

router.post('/add', function(req, res, next) {
    
    var u_id = 0000; //click by visitors
    if (req.body.u_id){
        u_id = req.body.u_id;
    }
    
    var addSQL = mysql.format("insert into jk_topics_clicks(tp_id,u_id,tp_ck_create_time) values (?,?,?)",[req.body.tp_id, u_id,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/search', function(req, res, next) {
    var searchSQL = mysql.format("select count(*) as clicks from jk_topics_clicks where tp_id = ?;", [req.param('tp_id')]);

    connection.query(searchSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/topUsers', function(req, res, next) {
    var searchSQL = "select count(u_id) as num, (select u_avatar from jk_users as jku where jku.u_id=jktc.u_id) as u_avatar,(select u_name from jk_users as jku where jku.u_id=jktc.u_id) as u_name from jk_topics_clicks as jktc group by u_id order by num desc limit 8;";

    connection.query(searchSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});







module.exports = router;
