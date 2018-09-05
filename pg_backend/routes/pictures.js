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

router.post('/delete', function(req, res, next) {
    var addSQL = mysql.format("delete from jk_pictures where pc_bigImg=?",[ req.body.bigImg]);
    console.log(addSQL);
    connection.query(addSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getPictures', function(req, res, next) {
    var sql = "select pc_bigImg as url from jk_pictures where u_id=" + req.param('u_id');
    var sqlRe;
    connection.query(sql, function(err, result) {
        sqlRe = result;
        res.send(sqlRe);
    });

});





module.exports = router;
