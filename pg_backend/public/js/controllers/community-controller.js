'use strict';

var community = angular.module('buybsControllers');
var eLike = 1;
var eFollow = 2;
var eCollect = 3;
var eComment = 4;
var eFootstep = 1;
var eTopic = 2;
var ePeople = 3;
function addEvent($http, $window, u_id, at_id, nf_to, tp_id, c_id, reload){
    if(u_id != nf_to) {
        var data = {
            u_id: u_id,
            at_id: at_id,
            nf_to: nf_to,
            tp_id: tp_id,
            c_id: c_id
        };
        var req = {
            method: 'POST',
            url: ipAddress + '/notifications/add',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        $http(req).success(function (result) {
            console.log('add event');
            if(reload) {
                $window.location.reload();
            }
        }, function (error) {
            console.log(error);
        });
    } else {
        if(reload){
            $window.location.reload();
        }
    }
}

community.controller('CommunityCtrl', ['$scope', '$cookies', '$window', '$http', '$css', '$sce', function($scope, $cookies, $window, $http, $css, $sce){
    $http({method: 'GET', url: ipAddress + '/topics/getTopics', params:{index_start: 0, count: 12, u_id: $cookies.get('u_id')}})
        .success(function(data){
            $scope.topics = data;
        },function(error){
            $scope.error = error;
        });
    $http({method: 'GET', url: ipAddress + '/topicClicks/topUsers'})
        .success(function(data){
            $scope.topUsers = data;
        },function(error){
            $scope.error = error;
        });
    $http({method: 'GET', url: ipAddress + '/topics/getTopicsNumber'})
        .success(function(data){
            $scope.number = data[0].number;
        },function(error){
            $scope.error = error;
        });
    $scope.shareFilter = function() {
        if($scope.type == '分享'){
            $scope.type = '';
            $scope.shareSelected = false;
            $('.shareFilter').css('background-color','white');
        } else {
            $('.shareFilter').css('background-color','#eee');
            if($scope.topicSelected){
                $('.topicFilter').css('background-color','white');
            }
            $scope.shareSelected = true;
            $scope.type = '分享';
        }
        $http({method: 'GET', url: ipAddress + '/topics/getTopics', params:{index_start: 0, count: 12, tp_type: $scope.type }})
            .success(function(data){
                $scope.topics = data;
            },function(error){
                $scope.error = error;
            });
    };
    $scope.topicFilter = function(val) {
        if($scope.type == '话题'){
            $scope.topicSelected = false;
            $scope.type = '';
            $('.topicFilter').css('background-color','white');
        } else {
            if($scope.shareSelected) {
                $('.shareFilter').css('background-color','white');
            }
            $('.topicFilter').css('background-color','#eee');
            $scope.topicSelected = true;
            $scope.type = '话题';
        }
        $http({method: 'GET', url: ipAddress + '/topics/getTopics', params:{index_start: 0, count: 12, tp_type: $scope.type }})
            .success(function(data){
                $scope.topics = data;
            },function(error){
                $scope.error = error;
            });
    };
    $scope.isbusy = false;
    $scope.loadMore = function() {
        if($scope.topics && $scope.number > $scope.topics.length) {
            $scope.isbusy = true;
            $http({
                method: 'GET',
                url: ipAddress + '/topics/getTopics',
                params: {index_start: $scope.topics.length, count: 3, tp_type: $scope.type}
            }).success(function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.topics.push(data[i]);
                    }
                    $scope.isbusy = false;
                }
            }, function (error) {
                $scope.error = error;
            });
        }
    };
    $scope.topicLoginCheck = function(tp_id) {
        var click = {
            tp_id: tp_id,
            u_id: $cookies.get('u_id')
        };
        var req = {
            method: 'POST',
            url: ipAddress + '/topicClicks/add',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(click)
        };
        $http(req).success(function(result){
            $window.location.href = "#/community/topics/" + tp_id;
        }, function(error){
            console.log(error);
        });
    };
    $scope.addLoginCheck = function() {
        if($cookies.get('u_id') == undefined){
            $window.location.href = '#/login';
            return;
        } else {
            $window.location.href = "#/community/topics/addTopic";
        }
    };
    $scope.renderHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
}]);

community.controller('TopicCtrl', ['$scope', '$cookies', '$window', '$http','$routeParams','$css','$sce', function($scope, $cookies, $window, $http, $routeParams, $css,$sce){
    $http({method: 'GET', url: ipAddress + '/topics/getTopicsByTPID', params:{tp_id: $routeParams.tp_id}})
        .success(function(data){
            $scope.topic = data[0];
            $scope.checkUser = $scope.topic.u_id == $cookies.get('u_id')? true: false;
        },function(error){
            $scope.error = error;
        });
    $http({method: 'GET', url: ipAddress + '/topicComments/getCommentsByTPID', params:{tp_id: $routeParams.tp_id}})
        .success(function(data){
            console.log(data);
            $scope.comments = data;
            $scope.commentNum = data.length;
        },function(error){
            $scope.error = error;
        });
    $http({method: 'GET', url: ipAddress + '/topicClicks/search', params:{tp_id: $routeParams.tp_id}})
        .success(function(data){
            $scope.clicks = data;
        },function(error){
            $scope.error = error;
        });
    $scope.renderHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    $scope.likeBtn = function(tp_id,u_id){
        if($cookies.get('u_id') == undefined){
            $window.location.href = '#/login';
            return;
        }
        var like = {
            tp_id: tp_id,
            u_id: $cookies.get('u_id')
        };
        var req = {
            method: 'POST',
            url: ipAddress + '/topicLikes/add',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(like)
        };
        $http(req).success(function(result){
            addEvent($http, $window, $cookies.get('u_id'),eLike,u_id,eTopic,tp_id, true);
        }, function(error){
            console.log(error);
        });
    };
    $scope.editBtn = function(tp_id) {
        $window.location.href = '#/community/topics/editTopic?tp_id=' + tp_id;
        $window.location.reload();
    };
    $scope.submit = function(){
        if($cookies.get('u_id') == undefined){
            $window.location.href = '#/login';
            return;
        }
        var replayData = {
            tp_id: $scope.topic.tp_id,
            u_id: $cookies.get('u_id'),
            tp_cm_to: 0,
            tp_cm_content: CKEDITOR.instances.editor1.getData()
        };
        var req = {
            method: 'POST',
            url: ipAddress + '/topicComments/add',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(replayData)
        };
        $http(req).success(function(result){
            addEvent($http,$window,$cookies.get('u_id'),eComment,$scope.topic.u_id,eTopic,$scope.topic.tp_id, true);
        }, function(error){
            console.log(error);
        });
    };
    $scope.closeTopic = function() {
        $window.location.href = '#/community/index';
    };
    $scope.loginCheck = function(){
        if($cookies.get('u_id') == undefined){
            return true;
        }
    };
}]);

community.controller('AddTopicCtrl', ['$scope', '$cookies', '$window', '$http','$routeParams','$css', function($scope, $cookies, $window, $http, $routeParams, $css){
    $http({method: 'GET', url: ipAddress + '/countries/getCountries'})
        .success(function(data){
            $scope.countries = data;
        }, function(error){
            $scope.error = error;
        });
    $scope.closeTopic = function() {
        $window.location.href = '#/community/index';
    };
    $scope.topic = {
        u_id: '',
        tp_about: '中国',
        tp_content: '从这里开始输入内容...',
        tp_img: '',
        tp_title: '',
        tp_type: '话题'
    };
    $scope.submit = function(){
        var tp_subject = "";
        if(CKEDITOR.instances.editor1.getData().length > 180){
            tp_subject = CKEDITOR.instances.editor1.getData().substr(0, 180);
        }else{
            tp_subject = CKEDITOR.instances.editor1.getData();
        }
        var replayData = {
            u_id: $cookies.get('u_id'),
            tp_about: $scope.topic.tp_about,
            tp_content: CKEDITOR.instances.editor1.getData(),
            tp_img: '',
            tp_title: $scope.topic.tp_title,
            tp_subject: tp_subject + '...',
            tp_type: $scope.topic.tp_type,
            secret: $cookies.get('secret')
        };
        if($scope.topic.tp_about == ''){
            $('.topic_add_msg').html('关于不能为空!');
            return;
        }
        if($scope.topic.tp_title == ''){
            $('.topic_add_msg').html('标题不能为空!');
            return;
        }
        if(replayData.tp_content == ''){
            $('.topic_add_msg').html('内容不能为空!');
            return;
        }
        var req = {
            method: 'POST',
            url: ipAddress + '/topics/create',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(replayData)
        };
        $http(req).success(function(result){
            if(result.errno){
                $('.topic_add_msg').html('发布失败');
            } else {
                $('.topic_add_msg').html('发布成功');
                $window.location.href= '#/community/index';
            }
        }, function(error){
            console.log(error);
        });
    };
}]);

community.controller('editTopicCtrl', ['$scope', '$cookies', '$window', '$http','$routeParams','$css','$sce', function($scope, $cookies, $window, $http, $routeParams, $css, $sce){
    $http({method: 'GET', url: ipAddress + '/countries/getCountries'})
        .success(function(data){
            $scope.countries = data;
        }, function(error){
            $scope.error = error;
        });
    $scope.closeTopic = function() {
        $window.location.href = '#/community/index';
    };
    $scope.renderHtml = function(value) {
        return $sce.trustAsHtml(value);
    };
    $http({method: 'GET', url: ipAddress + '/topics/getTopicsByTPID', params:{tp_id: $routeParams.tp_id}})
        .success(function(data){
            $scope.result = data[0];
        },function(error){
            $scope.error = error;
        });
    $scope.submit = function(){
        var tp_subject = "";
        if(CKEDITOR.instances.editor1.getData().length > 180){
            tp_subject = CKEDITOR.instances.editor1.getData().substr(0, 180);
        }else{
            tp_subject = CKEDITOR.instances.editor1.getData();
        }
        var replayData = {
            tp_id: $scope.result.tp_id,
            tp_about: $scope.result.tp_about,
            tp_content: CKEDITOR.instances.editor1.getData(),
            tp_title: $scope.result.tp_title,
            tp_subject: tp_subject + "...",
            tp_type: $scope.result.tp_type,
            secret: $cookies.get('secret'),
            u_id: $cookies.get('u_id')
        };
        if($scope.result.tp_about == ''){
            alert('关于不能为空!');
            return;
        }
        var req = {
            method: 'POST',
            url: ipAddress + '/topics/update',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(replayData)
        };
        $http(req).success(function(result){
            if(result.errno) {
                alert("修改失败, 请稍后再试.");
            } else {
                alert("修改成功");
                $window.location.href= '#/community/index';
            }
        }, function(error){
            console.log(error);
        });
    };
}]);