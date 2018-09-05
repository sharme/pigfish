var express = require('express');
var router = express.Router();

var fs = require('fs');
var qiniu = require("qiniu");
var busboy = require('connect-busboy');
var easyimg = require('easyimage');
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
var originalFolderPath = '';
var smallFolderPath = '';
var miniFolderPath = '';
var fileList = [];
router.get('/runScript', function(req, res) {

    originalFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/original/" + 21;
    smallFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/small/" + 21;
    miniFolderPath = __dirname.substr(0, __dirname.length - 7) + "/public/images/mini/" + 21;


    console.log("originalFolder: " + originalFolderPath);
    console.log("smallFolder: " + smallFolderPath);
    console.log("miniFolder: " + miniFolderPath);

    //调用文件遍历方法
    fileDisplay(originalFolderPath);

    function fileDisplay(filePath){
        //根据文件路径读取文件，返回文件列表
        fs.readdir(filePath,function(err,files){
            if(err){
                console.warn(err)
            }else{
                //遍历读取到的文件列表
                files.forEach(function(filename){
                    fileList.push(filename);

                });
                console.log("files: " + fileList);
                console.log("！！！！！！！！！！！The end!!!!!!!!!!!!!!!")
                resizeSmallMini(res);
            }
        });
    }
});

var indexFile = 0;
function resizeSmallMini() {
    
    console.log("length: " + fileList.length);
    
    fileList.forEach(function (filename, index) {
        
        if(index === indexFile) {
            console.log(filename + ", index: " + index);
            try {
                easyimg.resize({
                    src: originalFolderPath + "/" + filename,
                    dst: smallFolderPath + "/" + filename,
                    width: 200,
                    height: 200,
                    ignoreAspectRatio: true
                })
                    .then(function (image) {
                        console.log("resize small done, width: " + image.width + " , height: " + image.height);
                        indexFile = indexFile + 1;
                        if(indexFile < 682)
                            uploadFileQiniu("images/small/" + 21 + "/" + filename, smallFolderPath + "/" + filename);
                });
            }catch (e) {
                console.log(e);
            }
        }
    });
}


function uploadFileQiniu (targetCloudFolder, path) {
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
                    "imgUrl": "http://p9g6q4qna.bkt.clouddn.com/" + ret.key
                };
                console.log('uploaded = ' + JSON.stringify(data));
                resizeSmallMini();
            } else {
                // 上传失败， 处理返回代码
                console.log(err);
            }
        });
    }
}

module.exports = router;