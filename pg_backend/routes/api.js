var express = require('express');
var router = express.Router();
// var app = express();
var auth = require('./auth.js');

var fs = require('fs');
var qiniu = require("qiniu");
var busboy = require('connect-busboy');
var multipart = require('connect-multiparty');
var easyimg = require('easyimage');
var md5 = require("blueimp-md5");
var http = require('http');
router.use(busboy());

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'WhCKNGaKMNqjMVvnOeq2lidyIlKMvFCqrTAambLK';
qiniu.conf.SECRET_KEY = 'UD6-wbVzrrtmg9hbzd6qQyltumTAqAG75kogznxw';

//要上传的空间
bucket = '54taotao';

//上传到七牛后保存的文件名
key = 'my-nodejs-logo.png';


var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'fm@youtumi',
    database: 'pigfish'
});
connection.connect();
var date = new Date();

var smallSize = 420;  // 286 the original size
var bigSize = 860;   // 680 the original size
var widthPixel = 0;
var heightPixel = 0;

var multipartMiddleware = multipart();
// Upload file and response back.
router.post('/uploadPhotos', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    var folder = JSON.stringify(req.body.u_id);
    req.busboy.on('field', function(fieldname, val){
        if(fieldname == 'u_id')
            folder = val;
        if(fieldname == 'widthPixel')
            widthPixel = val;
        if(fieldname == 'heightPixel')
            heightPixel = val;
        console.log(fieldname + ": " + val);
    });
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Upload data: " + JSON.stringify(file) + ",folder = " + folder);
        filename = new Date().getTime() + filename.substr(filename.lastIndexOf("."));
        var originalFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/original/" + folder;
        var smallFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/small/" + folder;
        var bigFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/big/" + folder;
        var customPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/custom/" + folder;
        fs.exists(customPath, function(result){
            if(!result) {
                fs.mkdir(customPath, 0777, function(result){
                        console.log("custom mkdir: " + result);
                });
            }
        });

        fs.exists(originalFolderPath, function(result){
            if(result) {
                fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                file.pipe(fstream);
                fstream.on('close', function () {
                    fs.exists(smallFolderPath, function(result){
                        if(result) {
                            resize(filename, folder, smallFolderPath, originalFolderPath, bigFolderPath, smallSize, res, customPath, widthPixel, heightPixel);
                        } else {
                            fs.mkdir(smallFolderPath, 0777, function(result){
                                if(result){
                                    resize(filename, folder, smallFolderPath, originalFolderPath, bigFolderPath, smallSize, res, customPath, widthPixel, heightPixel);
                                } else {
                                    console.log(result);
                                }
                            });
                        }
                    });
                });
            } else {
                fs.mkdir(originalFolderPath, 0777, function(result){
                   if(result){
                       fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                       file.pipe(fstream);
                       fstream.on('close', function () {
                           fs.exists(smallFolderPath, function(result){
                               if(result) {
                                   resize(filename, folder, smallFolderPath, originalFolderPath, bigFolderPath, smallSize, res, customPath, widthPixel, heightPixel);
                               } else {
                                   fs.mkdir(smallFolderPath, 0777, function(result){
                                       if(result){
                                           resize(filename, folder, smallFolderPath, originalFolderPath, bigFolderPath, smallSize, res, customPath, widthPixel, heightPixel);
                                       } else {
                                           console.log(result);
                                       }
                                   });
                               }
                           });
                       });
                   } else {
                      console.log(result);
                   }
                });
            }
        });
    });
});


function updateSmallFileQiniu (folder, small, smallPath, big, bigPath, res) {
    //构建上传策略函数
    function uptoken(bucket, small) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+small);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, small);

    //要上传文件的本地路径
    filePath = smallPath;

    //构造上传函数
    function uploadFile(folder, uptoken, key, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);
              
                
                if(big == null || bigPath == null){
                    res.send("http://p9g6q4qna.bkt.clouddn.com/" + key);
                } else {
                    updateBigFileQiniu(folder, big, bigPath, res, "http://p9g6q4qna.bkt.clouddn.com/" + key);
                }

            } else {
                // 上传失败， 处理返回代码
                console.log(err);
            }
        });
    }

//调用uploadFile上传
    uploadFile(folder, token, small, filePath);

}

function updateCustomFileQiniu (folder, small, smallPath, big, bigPath, res) {
    
    console.log('custom Qiniu: '  + folder + ", small: " + small + " , smallPath: " + smallPath);
    
    //构建上传策略函数
    function uptoken(bucket, small) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+small);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, small);

    //要上传文件的本地路径
    filePath = smallPath;

    //构造上传函数
    function uploadFile(folder, uptoken, key, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);


                if(big == null || bigPath == null){
                    res.send("http://p9g6q4qna.bkt.clouddn.com/" + key);
                } else {
                    updateBigFileQiniu(folder, big, bigPath, res, "http://p9g6q4qna.bkt.clouddn.com/" + key);
                }

            } else {
                // 上传失败， 处理返回代码
                console.log(err);
            }
        });
    }

//调用uploadFile上传
    uploadFile(folder, token, small, filePath);

}

function updateBigFileQiniu (folder, key, path, res, smallImg) {
    //构建上传策略函数
    function uptoken(bucket, key) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, key);

    //要上传文件的本地路径
    filePath = path;

    //构造上传函数
    function uploadFile(folder, uptoken, key, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);
                
                var data = {
                    "bigImg": "http://p9g6q4qna.bkt.clouddn.com/" + key,
                    "smallImg": smallImg
                };
                
                console.log('uploaded = ' + JSON.stringify(data));

                //insert uploaded image url to database.
                var sql = mysql.format("insert into jk_pictures(u_id,pc_smallImg,pc_bigImg,pc_original,pc_update_time) values(?,?,?,?,?)",[folder,data.smallImg,data.bigImg,null,date]);
                console.log("uploadImage: " + sql);
                connection.query(sql, function (err, result) {
                        console.log(result);
                });
                
                res.send(data);
            } else {
                // 上传失败， 处理返回代码
                console.log(err);
            }
        });
    }

//调用uploadFile上传
    uploadFile(folder, token, key, filePath);

}

function resize(filename, folder, smallFolderPath, originalFolderPath, bigFolderPath, size, res, customPath, widthPixel, heightPixel) {
    
    console.log('resize');
    
    if(widthPixel > 0 && heightPixel > 0) {
        
        console.log('custom resize');
        
        easyimg.resize(
            {
                src: originalFolderPath + "/" + filename, dst: customPath + "/" + filename, width: widthPixel, height: heightPixel
            }
        ).then(
            function(image) {
                updateCustomFileQiniu(folder, "images/custom/" + folder + "/" + filename, customPath + "/" + filename, null, null, res);
                
            }
        );
    }
    
    console.log("resize more");
    
    if(smallFolderPath != null && bigFolderPath != null) {

        easyimg.resize({
            src: originalFolderPath + "/" + filename, dst: bigFolderPath + "/" + filename, width: bigSize
        }).then(
            function (image) {
                console.log('resize Big image: ' + image.width);
               
                easyimg.resize({
                    src: bigFolderPath + "/" + filename, dst: smallFolderPath + "/" + filename, width: size
                }).then(
                    function (image) {
                        console.log('resize small image: ' + image.width);

                        updateSmallFileQiniu(folder, "images/small/" + folder + "/" + filename, smallFolderPath + "/" + filename, "images/big/" + folder + "/" + filename, bigFolderPath + "/" + filename, res);

                    }
                );
            }
        );
    } else if(smallFolderPath != null && bigFolderPath == null) {
        easyimg.resize({
            src: originalFolderPath + "/" + filename, dst: smallFolderPath + "/" + filename, width: size
        }).then(
            function (image) {
                console.log('resize mini image: ' + image.width);
                
                updateSmallFileQiniu(folder, "images/mini/" + folder + "/" + filename, smallFolderPath + "/" + filename, null, null, res);

            }
        );
    }


}







// Upload file and response back.
router.post('/uploadAvatar', function(req, res) {

    var fstream;
    req.pipe(req.busboy);
    var folder = '';
    req.busboy.on('field', function(fieldname, val){
        folder = val;
        console.log(fieldname + ": " + folder);
    });
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Upload data: " + JSON.stringify(file) + ",folder = " + folder);
        filename = new Date().getTime() + filename.substr(filename.lastIndexOf("."));

        var originalFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/original/" + folder;
        var miniFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/mini/" + folder;


        fs.exists(originalFolderPath, function(result){
            if(result) {
                fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                file.pipe(fstream);
                fstream.on('close', function () {
                    fs.exists(miniFolderPath, function(result){
                        if(result) {
                            resize(filename, folder, miniFolderPath, originalFolderPath, null, 80, res);
                        } else {
                            fs.mkdir(miniFolderPath, 0777, function(result){
                                if(result){
                                    resize(filename, folder, smallFolderPath, originalFolderPath, null, 80, res);
                                } else {
                                    console.log(result);
                                }
                            });
                        }
                    });

                });
            } else {
                fs.mkdir(originalFolderPath, 0777, function(result){
                    if(result){
                        fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                        file.pipe(fstream);
                        fstream.on('close', function () {
                            fs.exists(miniFolderPath, function(result){
                                if(result) {
                                    resize(filename, folder, miniFolderPath, originalFolderPath, null, 80, res);
                                } else {
                                    fs.mkdir(miniFolderPath, 0777, function(result){
                                        if(result){
                                            resize(filename, folder, miniFolderPath, originalFolderPath, null, 80, res);
                                        } else {
                                            console.log(result);
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        console.log(result);
                    }
                });
            }
        });

    });
});


























var codeList = [];

var tempCodeList = [];

var ips = [];

var clearTempCodeList = setInterval(function(){
    tempCodeList = [];
},1000*60);


var clearCodeList = setInterval(function(){
    codeList = [];
},1000*60*60);

var clearIpsList = setInterval(function(){
    ips = [];
},1000*60*60);

var blacklist = [];
var whitelist = [];

router.get('/sendCode', function (req, res, next) {

    var to = req.param('to');
    
    if(to.length != 11 || isNaN(to.toString())) {
        res.send("非法请求, 拒绝");
        return;
    }
    
    var ipAddress = req.connection.remoteAddress;
    if(req.header['x-forwarded-for']){
        ipAddress = req.header['x-forwarded-for'];
        console.log("x-forward-for ip: " + ipAddress)
    }
    var send = true;
    console.log('Visitor IP: ' + ipAddress);
    ips.push({ip: ipAddress});
    console.log("tempList: " + JSON.stringify(tempCodeList));
    console.log("codeList: " + JSON.stringify(codeList));
    console.log("blackList: " + JSON.stringify(blacklist));

    tempCodeList.forEach(function(item, index){
        for (key in item){
            if(key === "to" && item[key] === to || key === 'ip' && item[key] === ipAddress){
                console.log("too many sending");
                send = false;
                res.send("02");
                return;
            }
        }
    });
    
    var checkCount = 0;
    codeList.forEach(function(item, index){
        for (key in item){
            if(key === 'ip' && item[key] === ipAddress){
               checkCount++;
            }
        }
    });
    
    console.log("IPs: " + JSON.stringify(ips));
    ips.forEach(function(item, index){
        for (key in item){
            if(key === 'ip' && item[key] === ipAddress){
                checkCount++;
            }
        }
    });
    
    blacklist.forEach(function(item, index){
        for (key in item){
            if(key === 'ip' && item[key] === ipAddress){
                send = false;
                console.log("拒绝访问, 非法请求, IP: " + ipAddress);
                res.send('03');
                return;
            }
        }
    });

    if(checkCount > 3) {
        blacklist.push({ip: ipAddress});

    }

    whitelist.forEach(function(item, index){
        for (key in item){
            console.log(key + " ; " + item[key]);
            if(key === 'ip' && item[key] === ipAddress){
                send = true;
                return;
            }
        }
    });
    
    console.log("Blacklist: " + JSON.stringify(blacklist));

    if(send) {
        // res.send("Send Msg --------------------------");
        sendSMS(res, to, ipAddress);
    }


});


function sendSMS(res, to, ipAddress){
    // return a random number between 1000 - 9999
    var code = Math.floor((Math.random() * 1000000) + 1);
    console.log("phone number: " + to);
    var codeUrl = "https://api.miaodiyun.com/20150822/industrySMS/sendSMS";
    var date = new Date();
    var year = date.getFullYear().toString();
    var month = (new Date().getMonth() + 1).toString();
    if (month <= 9) {
        month = 0 + month;
    }
    var day = date.getDate().toString();
    if (day <= 9) {
        day = 0 + day;
    }
    var hours = date.getHours().toString();
    if (hours <= 9) {
        hours = 0 + hours;
    }
    var min = date.getMinutes().toString();
    if (min <= 9) {
        min = 0 + min;
    }
    var seconds = date.getSeconds().toString();
    if (seconds <= 9) {
        seconds = 0 + seconds;
    }
    var time = year + month + day + hours + min + seconds;
    var sig = md5("49c9e38e67f44f778a921da9793a8237" + "7dce4a441bcb48c7bc0e63290fa83f21" + time);
    
    // var data = {
    //     accountSid: "49c9e38e67f44f778a921da9793a8237",
    //     smsContent: "【54淘淘】您的验证码为" + code +"，请于5分钟内正确输入，如非本人操作，请忽略此短信。",
    //     to: to,
    //     timestamp: time,
    //     sig: sig,
    //     templated: '261375280'
    // };

    var reqData = "";
    reqData += "accountSid=" + "49c9e38e67f44f778a921da9793a8237";
    reqData += "&smsContent=" + "【54淘淘】您的验证码为{1}，请于{2}分钟内正确输入，如非本人操作，请忽略此短信。";
    reqData += "&to=" + to;
    reqData += "&timestamp=" + time;
    reqData += "&sig=" + sig;
    reqData += "&templateid=" + "261375280";
    reqData += "&param=" + code + ",5";
    
    var req = {
        hostname: 'api.miaodiyun.com',
        port: 80,
        path: '/20150822/industrySMS/sendSMS',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    
    console.log("request data: " + JSON.stringify(req + " ; "+ reqData));
    
    var httpReq = http.request(req, function (response) {
        response.on("data", function(result){
            console.log("API response: " + JSON.parse(result).respCode + ";"  +" result: " + result );
            if("00000" === JSON.parse(result).respCode){
                if(res){
                    codeList.push({to: to, code: code, ip: ipAddress});
                    tempCodeList.push({to: to, code: code, ip: ipAddress});
                    res.send("01");
                }

            }else{
                if(res){
                    codeList.push({to: to, code: code, ip: ipAddress});
                    tempCodeList.push({to: to, code: code, ip: ipAddress});
                    res.send("00");
                }

            }
        });

    });
    httpReq.on("error", function(err){
        console.log("API response: " + err);
    });
    // write the request parameters
    console.log("request Parameters: " + reqData);
    httpReq.write(reqData);
    httpReq.end();
}


router.get('/checkCode', function (req, res, next) {
    
    var to = req.param('to');
    var scCode = req.param('scCode');
    var secret = req.param('secret');
    var check = true;
    console.log("codeList=" + JSON.stringify(codeList)  +"key=" + to + " ;val=" + scCode);
    codeList.forEach(function(item, index){
        var toVal = false;
        var scVal = false;
        for (var key in item){
            console.log(key + " ; " + item[key]);
            if(key === 'to' && item[key] === to){
                toVal = true;
            }
            if(key === 'code' && item[key] == scCode){
                scVal = true;
            }
        }
        console.log(toVal + " ; " + scVal);
        if(toVal && scVal) {
            check = false;
            
            if(secret){
                var code = auth.encrypt(to);
                auth.addList(code);
                res.send(code);
            } else {
                res.send("01");
            }
        } else {
            check = false;
            res.send("00");
        }

    });
    if(check) {
        console.log('code list is empty.');
        res.send("03");
    }
});




module.exports = router;