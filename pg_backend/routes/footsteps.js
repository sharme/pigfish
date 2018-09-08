var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var auth = require('./auth.js');
var bodyParser = require('body-parser');
var requestIp = require('request-ip');
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

router.get('/getFootsteps', function(req, res, next) {

    var u_id = req.param('u_id');
    
    var criteriaSQL = "";
    if(u_id) {
         criteriaSQL = mysql.format("select fs_id, u_id, fs_sales, fs_promo, fs_discount, fs_disPic, fs_des," +
             "(select count(*) from jk_comments as jkc where jkc.fs_id = jkf.fs_id) as comments," + 
            "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
            "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
            "(select count(*) from jk_followers as jkfo where jkfo.u_id = jkf.u_id and jkfo.fl_fl_id = ?) as follow," +
            "(select (select u_name from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_name," +
            "(select cm_content from jk_comments as jkc where jkc.fs_id = jkf.fs_id limit 1) as cm_content," +
            "fs_create_time, fs_country, fs_city " +
            " from jk_footsteps as jkf where jkf.fs_status=1",[req.param('u_id'),req.param('u_id'),req.param('u_id')]);
    } else {
        criteriaSQL = "select fs_id, u_id, fs_price, fs_sales, fs_commission, fs_promo, fs_discount, fs_platform, fs_disPic, fs_des, fs_from," +
            "(select count(*) from jk_sticks as jks where jks.fs_id = jkf.fs_id) as sticks," +
            "(select count(*) from jk_comments as jkc where jkc.fs_id = jkf.fs_id) as comments," +
            "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
            "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
            "(select count(*) from jk_likes as jkl where jkl.fs_id = jkf.fs_id) as likes," +
            "(select count(*) from jk_followers as jkfo where jkfo.u_id = jkf.u_id and jkfo.fl_fl_id = 0) as follow," +
            "(select (select u_avatar from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_avatar," +
            "(select (select u_name from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_name," +
            "(select cm_content from jk_comments as jkc where jkc.fs_id = jkf.fs_id limit 1) as cm_content," +
            "fs_create_time, fs_country, fs_city " +
            " from jk_footsteps as jkf where jkf.fs_status=1 ";
    }
    
    console.log(req.param('fs_from'));

    if(req.param('fs_from')){
        criteriaSQL += " and jkf.fs_from='" + req.param('fs_from') + "'";
    }
    
    if(req.param('fs_platform')) {
        criteriaSQL += " and jkf.fs_platform='" + req.param('fs_platform') + "'";
    }
    
    criteriaSQL += " order by fs_create_time desc";
    
    if(req.param('index_start') && req.param('count')) {
        criteriaSQL += " limit " + req.param('index_start') + "," + req.param('count');
    }
    console.log(criteriaSQL);
    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFootstepsByTag', function(req, res, next) {

    var criteriaSQL = "";
    if(req.param('searchVal')) {
        criteriaSQL = "select fs_id, u_id, fs_price, fs_sales, fs_commission, fs_promo, fs_discount, fs_platform, fs_disPic, fs_disPic2, fs_disPic3, fs_disPic4, fs_des, fs_from," +
            "(select count(*) from jk_sticks as jks where jks.fs_id = jkf.fs_id) as sticks," +
            "(select count(*) from jk_comments as jkc where jkc.fs_id = jkf.fs_id) as comments," +
            "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
            "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
            "(select count(*) from jk_likes as jkl where jkl.fs_id = jkf.fs_id) as likes," +
            "(select count(*) from jk_followers as jkfo where jkfo.u_id = jkf.u_id and jkfo.fl_fl_id = 0) as follow," +
            "(select (select u_avatar from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_avatar," +
            "(select (select u_name from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_name," +
            "(select cm_content from jk_comments as jkc where jkc.fs_id = jkf.fs_id limit 1) as cm_content," +
            "fs_create_time, fs_country, fs_city " +
            " from jk_footsteps as jkf where jkf.fs_status=1 and jkf.fs_country like '%" + req.param('searchVal') + "%' or jkf.fs_city like '%" + req.param('searchVal') + "%'";
    } else {
        criteriaSQL = "select fs_id, u_id, fs_price, fs_sales, fs_commission, fs_promo, fs_discount, fs_platform, fs_disPic, fs_disPic2, fs_disPic3, fs_disPic4, fs_des, fs_from," +
            "(select count(*) from jk_sticks as jks where jks.fs_id = jkf.fs_id) as sticks," +
            "(select count(*) from jk_comments as jkc where jkc.fs_id = jkf.fs_id) as comments," +
            "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
            "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
            "(select count(*) from jk_likes as jkl where jkl.fs_id = jkf.fs_id) as likes," +
            "(select count(*) from jk_followers as jkfo where jkfo.u_id = jkf.u_id and jkfo.fl_fl_id = 0) as follow," +
            "(select (select u_avatar from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_avatar," +
            "(select (select u_name from jk_users as jku where jku.u_id = jkc.u_id) from jk_comments as jkc where jkc.fs_id=jkf.fs_id limit 1) as u_name," +
            "(select cm_content from jk_comments as jkc where jkc.fs_id = jkf.fs_id limit 1) as cm_content," +
            "fs_create_time, fs_country, fs_city " +
            " from jk_footsteps as jkf where jkf.fs_status=1 ";
    }

    criteriaSQL += " order by fs_create_time desc";
    if(req.param('index_start') && req.param('count')) {
        criteriaSQL += " limit " + req.param('index_start') + "," + req.param('count');
    }

    console.log(criteriaSQL);
    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFootstepsByUID', function(req, res, next) {
    
    var criteriaSQL = mysql.format("select fs_id, u_id, fs_disPic, fs_des," +
        "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
        "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
        "fs_create_time, fs_country, fs_city, fs_promo " +
        " from jk_footsteps as jkf where jkf.fs_status=1 and jkf.u_id =? ",[req.param('u_id')]);

    criteriaSQL += " order by fs_create_time desc";
    if(req.param('index_start') && req.param('count')) {
        criteriaSQL += " limit " + req.param('index_start') + "," + req.param('count');
    }
    
    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFootstepsNumber', function(req, res, next) {
    var criteriaSQL = "select count(*) as number from jk_footsteps as jkf where jkf.fs_status = 1";
    
    if(req.param('fs_platform')) {
        criteriaSQL += " and jkf.fs_platform='" + req.param('fs_platform') + "'";
    }
    connection.query(criteriaSQL, function(err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getLikeFootstepsByUID', function(req, res, next) {

    var criteriaSQL = mysql.format("select fs_id, u_id, fs_disPic, fs_des," +
        "(select u_avatar from jk_users as jku where jku.u_id=jkf.u_id) as u_tag," +
        "(select u_name from jk_users as jku where jku.u_id=jkf.u_id) as u_tag_name," +
        "fs_create_time, fs_country, fs_city, fs_promo " +
        " from jk_footsteps as jkf where jkf.fs_status=1 and jkf.u_id =? and jkf.fs_id in (select fs_id from jk_likes as jkl where jkl.u_id = ?) ",[req.param('u_id'),req.param('u_id')]);
    
    criteriaSQL += " order by fs_create_time desc";
    if(req.param('index_start') && req.param('count')) {
        criteriaSQL += " limit " + req.param('index_start') + "," + req.param('count');
    }

    console.log(criteriaSQL);
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

        var createSQL = mysql.format("insert into jk_footsteps(fs_pic,fs_des,fs_from,u_id,fs_bigImg," +
            "fs_smallImg,fs_create_time,fs_update_time, fs_status, fs_pic2, fs_pic3, fs_pic4, fs_pic5," +
            " fs_pic6, fs_pic7, fs_pic8, fs_disPic, fs_disPic2, fs_disPic3, fs_disPic4, fs_price, fs_sales, fs_commission, fs_promo, fs_discount, fs_platform, fs_country, fs_city) values(?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [req.body.fs_pic,
            req.body.fs_des, req.body.fs_from, req.body.u_id, req.body.fs_bigImg, req.body.fs_smallImg, date, 0, req.body.fs_pic2, 
            req.body.fs_pic3, req.body.fs_pic4, req.body.fs_pic5, req.body.fs_pic6, req.body.fs_pic7, req.body.fs_pic8, req.body.fs_disPic,
        req.body.fs_disPic2, req.body.fs_disPic3, req.body.fs_disPic4, req.body.fs_price, req.body.fs_sales, req.body.fs_commission, req.body.fs_promo, req.body.fs_discount, req.body.fs_platform, req.body.fs_country, req.body.fs_city]);

        connection.query(createSQL, function (err, result) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                var addEvent = mysql.format("insert into jk_events(u_id,et_type,et_create_time) values (?,?,?)",[req.body.u_id, 'publish',date]);
                connection.query(addEvent);
                connection.query('select jkf.fl_fl_id, (select fs_id from jk_footsteps as jkft where jkft.u_id=jkf.u_id order by fs_create_time desc limit 0,1) as fs_id from jk_followers as jkf where jkf.u_id = ' + req.body.u_id, function (err, result) {
                    result.forEach(function(item, index){
                        var fl_fl_id;
                        var fs_id;
                        for (key in item){
                            console.log(key + " ; " + item[key]);

                            if (key == 'fl_fl_id') {
                                fl_fl_id = item[key];
                            }
                            if (key == 'fs_id') {
                                fs_id = item[key];
                            }
                        }
                        var sendNotification = mysql.format("insert into jk_notifications(u_id,at_id,nf_to,tp_id,c_id,nf_status,nf_create_time) values (?,?,?,?,?,?,?)",[ req.body.u_id, 5, fl_fl_id, 1, fs_id, 0, date]);
                        connection.query(sendNotification);
                    });
                });
                res.send(result);
            }
        })
    } else {
        res.send({errno: 1001, code: 'access denied'});
    }
});

router.post('/delete', function(req, res, next) {
    var createSQL = mysql.format("delete from jk_footsteps where fs_id=?", [req.body.fs_id]);

    connection.query(createSQL, function (err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/getFootstepsDetail', function (req, res, next) {
   var criteriaSQL = mysql.format("select fs_id,u_id,fs_des,fs_pic," +
       "(select count(*) from jk_comments as jkc where jkc.fs_id = jkf.fs_id) as comments," +
       "(select count(*) from jk_sticks as jks where jks.fs_id = jkf.fs_id) as sticks," +
       "(select count(*) from jk_followers as jkfs where jkfs.u_id = jkf.u_id and jkfs.fl_fl_id = ?) as follow," +
       "(select count(*) from jk_likes as jkl where jkl.fs_id = jkf.fs_id) as likes," +
       "(select count(*) from jk_likes as jkl where jkl.fs_id = jkf.fs_id and u_id = ?) as like_status," +
       "(select u_name from jk_users as jku where jku.u_id = jkf.u_id) as u_name," +
           "(select u_avatar from jk_users as jku where jku.u_id = jkf.u_id) as u_avatar," +
       "(select u_slogan from jk_users as jku where jku.u_id = jkf.u_id) as u_slogan, fs_smallImg, fs_bigImg, fs_pic2, fs_pic3, fs_pic4, fs_pic5, fs_pic6, fs_pic7, fs_pic8, fs_price, fs_sales, fs_commission, fs_promo, fs_discount, fs_platform, fs_country, fs_city, fs_create_time, fs_pv from jk_footsteps as jkf where jkf.fs_id = ?", [req.param('u_id'), req.param('u_id') , req.param('fs_id')]);
    connection.query(criteriaSQL, function (err, result) {
        if(err) {
            res.send("Error: " + err);
        } else {
            var addPv = mysql.format("update jk_footsteps set fs_pv = ? where fs_id = ?",[result[0].fs_pv + 1, req.param('fs_id')]);
            connection.query(addPv);
            res.send(result);
        }
    })
});

router.get('/getRecommendations', function (req, res, next) {

    // Vector 1: The same country
    // Vector 2: The most liked
    // Vector 3: The most PV

    // select fs_id from jk_footsteps where fs_pv = (select MAX(fs_pv) from jk_footsteps where fs_country = '中国');
    // select count(fs_id) as ranking from jk_likes group by fs_id order by ranking desc limit 2;
    // select fs_id, fs_pv from jk_footsteps order by fs_pv desc limit 1;

    var fsId1 = "";
    var fsId2 = "";
    var fsId3 = "";
    var fsId4 = "";

    var top1 = mysql.format("select fs_id from jk_footsteps where fs_pv = (select MAX(fs_pv) from jk_footsteps where fs_country = ?)", [req.param('fs_country')]);
    var top23 = "select fs_id, count(fs_id) as ranking from jk_likes group by fs_id order by ranking desc limit 2";
    var top4 = "select fs_id, fs_pv from jk_footsteps order by fs_pv desc limit 1";

    connection.query(top1, function (err, result) {
        fsId1 = result[0].fs_id;
        connection.query(top23, function (err, result2) {
            fsId2 = result2[0].fs_id;
            fsId3 = result2[1].fs_id;
            connection.query(top4, function (err, result3) {
                fsId4 = result3[0].fs_id;
                var querySql = mysql.format("select fs_id, u_id, fs_promo, fs_country, fs_city, fs_disPic from jk_footsteps where fs_id != ? and fs_id in (?,?,?,?) ", [req.param('fs_id'), fsId1, fsId2, fsId3, fsId4]);
                console.log("fsIds: " + querySql);
                connection.query(querySql, function (err, result) {
                   if(err) {
                       res.send("Error: " + err);
                   } else  {
                       res.send(result);
                   } 
                });
            });
        });
    });
});

module.exports = router;