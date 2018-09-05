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
    var addSQL = mysql.format("insert into jk_topics_likes(tp_id,u_id,tp_lk_create_time) values (?,?,?)",[req.body.tp_id, req.body.u_id,date]);

    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/search', function(req, res, next) {
    var searchSQL = mysql.format("select * from jk_topics_likes where tp_id = ?;", [req.param('tp_id')]);

    connection.query(searchSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })

});







module.exports = router;
