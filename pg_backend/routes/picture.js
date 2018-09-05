var express = require('express');
var router = express.Router();

var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var watermark = require('image-watermark');
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


var widthPixel = 0;
var heightPixel = 0;
var rotateDegree =0;
var waterMark = '';
var folder = 0;
var color = '';
var smallFolderPath = '';
var miniFolderPath = '';
var originalFolderPath = '';
// Upload file and response back.
router.post('/uploadPhotos', function(req, res) {

    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('field', function(fieldname, val){
        if(fieldname == 'u_id')
            folder = val;
        if(fieldname == 'widthPixel')
            widthPixel = 400;
        if(fieldname == 'heightPixel')
            heightPixel = val;
        if(fieldname == 'rotateDegree')
            rotateDegree = val;
        if(fieldname == 'waterMark' && val)
            waterMark = val;
        if(fieldname == 'color')
            color = val;

        console.log(fieldname + ": " + val);
    });
    
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Upload data: " + JSON.stringify(file) + ",folder = " + folder);

            filename = new Date().getTime() + filename.substr(filename.lastIndexOf("."));

            originalFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/original/" + folder;
            var customFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/custom/" + folder;
            var bigFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/big/" + folder;
            smallFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/small/" + folder;
            miniFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/mini/" + folder;


            console.log("original: " + originalFolderPath);
            console.log("original: " + customFolderPath);
            console.log("original: " + bigFolderPath);
        
            fs.exists(originalFolderPath, function (result) {
                if (result) {
                    fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                    file.pipe(fstream);
                    fstream.on('close', function () {
                        fs.exists(customFolderPath, function (result) {
                            if (result) {
                                resize(filename, folder, customFolderPath, originalFolderPath, bigFolderPath, res, widthPixel, heightPixel);
                            } else {
                                fs.mkdir(customFolderPath, 0777, function (result) {
                                    if (result) {
                                        resize(filename, folder, customFolderPath, originalFolderPath, bigFolderPath, res, widthPixel, heightPixel);
                                    } else {
                                        console.log(result);
                                    }
                                });
                            }
                        });

                    });
                } else {
                    fs.mkdir(originalFolderPath, 0777, function (result) {
                        if (result) {
                            fstream = fs.createWriteStream(originalFolderPath + "/" + filename);
                            file.pipe(fstream);
                            fstream.on('close', function () {
                                fs.exists(customFolderPath, function (result) {
                                    if (result) {
                                        resize(filename, folder, customFolderPath, originalFolderPath, bigFolderPath, res, widthPixel, heightPixel);
                                    } else {
                                        fs.mkdir(customFolderPath, 0777, function (result) {
                                            if (result) {
                                                resize(filename, folder, customFolderPath, originalFolderPath, bigFolderPath, res, widthPixel, heightPixel);
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




function resize(filename, folder, customFolderPath, originalFolderPath, bigFolderPath, res, widthPixel, heightPixel) {

    console.log('resize');
    
    easyimg.resize({
        src: originalFolderPath + "/" + filename, dst: customFolderPath + "/" + filename, width: widthPixel, height: heightPixel, ignoreAspectRatio: true
    }).then(
        function (image) {
            console.log('resize custom image width: ' + image.width + " , height: " + image.height);
    
            if(rotateDegree > 0) {
                easyimg.rotate({
                    src: customFolderPath + "/" + filename,
                    dst: customFolderPath + "/" + filename,
                    width: widthPixel,
                    height: heightPixel,
                    degree: rotateDegree,
                    background: "#"+color
                }).then(
                    function (image) {
                        if(waterMark != ''){
                            gm(customFolderPath + "/" + filename)
                                .stroke("#F08080")
                                .encoding("Latin 2")
                                .font('Arial')
                                .fontSize(14)
                                .fill('#9E9E9E')
                                .drawText(0, 0, waterMark, 'SouthEast')
                                .write(customFolderPath + "/" + filename, function (err) {
                                    console.log('watermark done: ' + err);
                                });
                        }
                    }
                );
            } else {
                easyimg.resize({
                    src: originalFolderPath + "/" + filename, dst: customFolderPath + "/" + filename, width: widthPixel, 
                    height: heightPixel,
                    ignoreAspectRatio: true,
                    background: "#" + color
                }).then(
                    function (image) {
                        if(waterMark != ''){
                            gm(customFolderPath + "/" + filename)
                                .stroke("#F08080")
                                .encoding("Latin 2")
                                .font('Arial')
                                .fontSize(14)
                                .fill('#9E9E9E')
                                .drawText(10, 0, waterMark, 'SouthEast')
                                .write(customFolderPath + "/" + filename, function (err) {
                                    console.log('watermark done');
                                });
                        }
                    }
                );
            }
        }
    
    );
    

    easyimg.resize({
        src: originalFolderPath + "/" + filename, dst: bigFolderPath + "/" + filename, width: widthPixel * 2, height: heightPixel * 2, ignoreAspectRatio: true
    }).then(
        function (image) {
            console.log('resize big image width: ' + image.width + " , height: " + image.height);

            if(rotateDegree > 0) {
                easyimg.rotate({
                    src: bigFolderPath + "/" + filename,
                    dst: bigFolderPath + "/" + filename,
                    width: widthPixel * 2,
                    height: heightPixel * 2,
                    degree: rotateDegree,
                    background: "#"+color
                }).then(
                    function (image) {
                        if(waterMark != ''){
                            gm(bigFolderPath + "/" + filename)
                                .stroke("#F08080")
                                .encoding("Latin 2")
                                .font('Arial')
                                .fontSize(14)
                                .fill('#9E9E9E')
                                .drawText(0, 0, waterMark, 'SouthEast')
                                .write(bigFolderPath + "/" + filename, function (err) {
                                    console.log('watermark done: ' + err);
                                    uploadFileToQiniu(folder, "images/big/" + folder + "/" + filename, bigFolderPath + "/" + filename, "images/custom/" + folder + "/" + filename, customFolderPath + "/" + filename, res);
                                });
                        } else {
                            uploadFileToQiniu(folder, "images/big/" + folder + "/" + filename, bigFolderPath + "/" + filename, "images/custom/" + folder + "/" + filename, customFolderPath + "/" + filename, res);
                        }

                    }
                );
            } else {
                easyimg.resize({
                    src: originalFolderPath + "/" + filename,
                    dst: bigFolderPath + "/" + filename, width: widthPixel * 2,
                    height: heightPixel * 2,
                    ignoreAspectRatio: true,
                    background: "#" + color
                }).then(
                    function (image) {
                        if(waterMark != ''){
                            gm(bigFolderPath + "/" + filename)
                                .stroke("#F08080")
                                .encoding("Latin 2")
                                .font('Arial')
                                .fontSize(14)
                                .fill('#9E9E9E')
                                .drawText(10, 0, waterMark, 'SouthEast')
                                .write(bigFolderPath + "/" + filename, function (err) {
                                    console.log('watermark done');
                                    uploadFileToQiniu(folder, "images/big/" + folder + "/" + filename, bigFolderPath + "/" + filename, "images/custom/" + folder + "/" + filename, customFolderPath + "/" + filename, res);

                                });
                        } else {
                            uploadFileToQiniu(folder, "images/big/" + folder + "/" + filename, bigFolderPath + "/" + filename, "images/custom/" + folder + "/" + filename, customFolderPath + "/" + filename, res);
                        }

                    }
                );
            }
        }
    );

    easyimg.resize({
        src: originalFolderPath + "/" + filename, dst: smallFolderPath + "/" + filename, width: 200, height: 200, ignoreAspectRatio: true
    }).then(

        function (image) {
            console.log('resize small image width: ' + image.width + " , height: " + image.height);
            if(waterMark != ''){
                gm(smallFolderPath + "/" + filename)
                    .stroke("#F08080")
                    .encoding("Latin 2")
                    .font('Arial')
                    .fontSize(14)
                    .fill('#9E9E9E')
                    .drawText(10, 0, waterMark, 'SouthEast')
                    .write(smallFolderPath + "/" + filename, function (err) {
                        console.log('watermark done');
                        updateSmallFileQiniu("images/small/" + folder + "/" + filename, smallFolderPath + "/" + filename);
                    });
            } else {
                updateSmallFileQiniu("images/small/" + folder + "/" + filename, smallFolderPath + "/" + filename);                
            }
        }

    );

    easyimg.resize({
        src: originalFolderPath + "/" + filename, dst: miniFolderPath + "/" + filename, width: 100, height: 100, ignoreAspectRatio: true
    }).then(
        function (image) {
            console.log('resize mini image width: ' + image.width + " , height: " + image.height);
            if(waterMark != ''){
                gm(miniFolderPath + "/" + filename)
                    .stroke("#F08080")
                    .encoding("Latin 2")
                    .font('Arial')
                    .fontSize(14)
                    .fill('#9E9E9E')
                    .drawText(10, 0, waterMark, 'SouthEast')
                    .write(miniFolderPath + "/" + filename, function (err) {
                        console.log('watermark done');
                        updateMiniFileQiniu("images/mini/" + folder + "/" + filename, miniFolderPath + "/" + filename);
                    });
            } else {
                updateMiniFileQiniu("images/mini/" + folder + "/" + filename, miniFolderPath + "/" + filename);
            }
        }
    );
    
    
    
}



function uploadFileToQiniu (folder, targetCloudFolder, customPath, originalCloudFolder, originalPath, res) {

    //构建上传策略函数
    function uptoken(bucket, small) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+targetCloudFolder);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, targetCloudFolder);

    //要上传文件的本地路径
    filePath = customPath;

    //构造上传函数
    function uploadFile(folder, uptoken, targetCloudFolder, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, targetCloudFolder, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);

                updateBigFileQiniu(folder, originalCloudFolder, originalPath, res, "http://p9g6q4qna.bkt.clouddn.com/" + ret.key);

            } else {
                // 上传失败， 处理返回代码
                console.log(err);
            }
        });
    }

    //调用uploadFile上传
    uploadFile(folder, token, targetCloudFolder, filePath);

}



function updateBigFileQiniu (folder, targetCloudFolder, path, res, customImg) {
    //构建上传策略函数
    function uptoken(bucket, targetCloudFolder) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+targetCloudFolder);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, targetCloudFolder);

    //要上传文件的本地路径
    filePath = path;

    //调用uploadFile上传
    uploadFile(folder, token, targetCloudFolder, filePath);

    //构造上传函数
    function uploadFile(folder, uptoken, targetCloudFolder, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, targetCloudFolder, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);
                
                var data = {
                    "customImg": "http://p9g6q4qna.bkt.clouddn.com/" + ret.key,
                    "originalImg": customImg
                };

                console.log('uploaded = ' + JSON.stringify(data));

                //insert uploaded image url to database.
                var sql = mysql.format("insert into jk_pictures(u_id,pc_smallImg,pc_bigImg,pc_original,pc_update_time) values(?,?,?,?,?)",[folder,data.customImg,null, data.originalImg,date]);
                console.log(sql);
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
}


function updateSmallFileQiniu (targetCloudFolder, path) {
    //构建上传策略函数
    function uptoken(bucket, targetCloudFolder) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+targetCloudFolder);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, targetCloudFolder);
    //要上传文件的本地路径
    filePath = path;
    //调用uploadFile上传
    uploadFile(token, targetCloudFolder, filePath);
    //构造上传函数
    function uploadFile(uptoken, targetCloudFolder, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, targetCloudFolder, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);
                var data = {
                    "smallImg": "http://p9g6q4qna.bkt.clouddn.com/" + ret.key
                };
                console.log('uploaded = ' + JSON.stringify(data));
            } else {
                console.log(err);
            }
        });
    }
}

function updateMiniFileQiniu (targetCloudFolder, path) {
    //构建上传策略函数
    function uptoken(bucket, targetCloudFolder) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+targetCloudFolder);
        return putPolicy.token();
    }

    //生成上传 Token
    token = uptoken(bucket, targetCloudFolder);
    //要上传文件的本地路径
    filePath = path;
    //调用uploadFile上传
    uploadFile(token, targetCloudFolder, filePath);
    //构造上传函数
    function uploadFile(uptoken, targetCloudFolder, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, targetCloudFolder, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);
                var data = {
                    "miniImg": "http://p9g6q4qna.bkt.clouddn.com/" + ret.key
                };
                console.log('uploaded = ' + JSON.stringify(data));
            } else {
                console.log(err);
            }
        });
    }
}



module.exports = router;