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


router.get('/getCountries', function(req, res, next) {
    connection.query('select * from jk_countries', function(err, result) {
       if(err) {
           res.send("Error: " + err);
       } else {
           res.send(result);
       }
    });
});





module.exports = router;