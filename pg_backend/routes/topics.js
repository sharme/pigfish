var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var auth = require('./auth');
var requestIP = require('request-ip');
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

router.get('/getTopics', function(req, res, next) {
    
    var u_id = req.param('u_id');

    var criteriaSQL = "select tp_id, (select u_name from jk_users jku where jku.u_id=jkt.u_id) as u_name,(select u_avatar from jk_users jku where jku.u_id=jkt.u_id) as u_avatar, (select count(*) from jk_topics_likes as jktl where jktl.tp_id=jkt.tp_id) as likes, tp_title, tp_content, tp_about, tp_img, tp_update_time,tp_subject from jk_topics as jkt";

    console.log(req.param('fs_about'));

    if(req.param('fs_about')){
        criteriaSQL += " where jkf.fs_from='" + req.param('fs_from') + "'";
    }

    if(req.param('tp_type')){
        criteriaSQL += " where jkt.tp_type='" + req.param('tp_type') + "'";
    }

    criteriaSQL += " order by tp_update_time desc";
    if(req.param('index_start') && req.param('count')) {
        criteriaSQL += " limit " + req.param('index_start') + "," + req.param('count');
    }
    
    console.log(criteriaSQL);

    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send(err);
        } else {

            var log = u_id?"用户: " + u_id + " 访问了社区":'游客 访问了社区';
            var ipAddress = requestIP.getClientIp(req);
		console.log("headers: " +JSON.stringify(req.headers));
        	console.log("X-Forwarded-For: " + req.headers['x-forwarded-for']);
                console.log("connection remoteadress: " + req.connection.remoteAddress);
console.log("socket remoteadress: " + req.socket.remoteAddress);
console.log("X-Real-IP: " + req.headers['x-real-ip']);
console.log("IP: " + req.ip);
	    var insertLog = mysql.format("insert into jk_logs(lg_content,lg_ip,lg_create_time) values(?,?,?)",[log,ipAddress,date]);
            connection.query(insertLog, function(err, result){
                console.log(insertLog);
                if(err)
                    console.log(err);
                else
                    console.log(result);
            });
            
            res.send(result);
        }
    })
});

router.get('/getTopicsNumber', function(req, res, next) {
    var criteriaSQL = "select count(*) as number from jk_topics;";

    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.post('/create', function(req, res, next) {
    
    if(req.body.secret == auth.encrypt(req.body.u_id)) {

        var createSQL = mysql.format("insert into jk_topics(u_id,tp_about,tp_content,tp_img,tp_title,tp_create_time,tp_update_time,tp_subject,tp_type) values(?,?,?,?,?,?,?,?,?)", [req.body.u_id, req.body.tp_about, req.body.tp_content, req.body.tp_img, req.body.tp_title, date, date, req.body.tp_subject, req.body.tp_type]);

        connection.query(createSQL, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        })
    } else {
        res.send({errno: 1001, code: 'access denied'})
    }
});

router.post('/update', function(req, res, next) {

    if(req.body.secret == auth.encrypt(req.body.u_id)) {

        var createSQL = mysql.format("update jk_topics set tp_about=?, tp_content=?, tp_title=?, tp_update_time=?, tp_subject=?, tp_type=? where tp_id=?", [req.body.tp_about, req.body.tp_content, req.body.tp_title, date, req.body.tp_subject, req.body.tp_type, req.body.tp_id]);
        connection.query(createSQL, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        })
    } else {
        res.send({errno: 1001, code: 'access denied'})
    }
});

router.get('/getTopicsByTPID', function (req, res, next) {
    var criteriaSQL = mysql.format("select tp_id, u_id, (select u_name from jk_users jku where jku.u_id=jkt.u_id) as u_name, (select u_avatar from jk_users jku where jku.u_id=jkt.u_id) as u_avatar, (select count(*) from jk_topics_likes as jktl where jktl.tp_id=jkt.tp_id) as likes, tp_title, tp_content, tp_about, tp_img, tp_update_time, tp_type from jk_topics as jkt where jkt.tp_id=?", [req.param('tp_id')]);

    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })

});





module.exports = router;
