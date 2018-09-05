'use strict';

var account = angular.module('buybsControllers');
account.controller('EmailRegistrationCtrl', ['$scope', '$cookies', '$window','$http','$css', function($scope, $cookies, $window,$http, $css){
    $scope.user = {
        u_name: '',
        u_email: '',
        u_pwd: '',
        agreement: "checked"
    };
    $scope.submit = function(){
        if($("#register-form-password").val().length < 8){
            $('.validation_msg').html("密码长度不能小于8位数.");
            return;
        }
        if($("#register-form-username").val().length > 15) {
            $('.validation_msg').html("用户名长度不能大于16位数.");
            return;
        }
        var postData = $scope.user;
        var req = {
            method: 'POST',
            url: ipAddress + '/users/email',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(postData)
        };
        $http(req).success(function (result) {
            if(result.code == 'ER_DUP_ENTRY'){
                $(".validation_msg").html("该邮箱已经被人注册了.");
            } else if(result.errno){
                $(".validation_msg").html("注册失败, 请联系管理员. admin@fmyoutu.com");
            }else if(result.stage){
                $(".validation_msg").html("邮箱不正确, 请填写正确的邮箱.");
            } else {
                $('.validation_msg').html("发送成功, 请您查看邮箱并完成注册操作.  如果已完成验证, 点击这里 <a href='#/email_login' style='color: black;'>登录</a>");
            }
        }, function (error) {
            console.log(error);
        });
    };
}]);

account.controller('EmailLoginCtrl', ['$scope', '$cookies', '$window','$http','$css', function($scope, $cookies, $window,$http, $css){
    $scope.user = {
        u_email: '',
        u_pwd: ''
    };
    $scope.goBack = function() {
        $window.history.back();
    };
    $scope.submit = function(){
            var postData = $scope.user;
            var req = {
                method: 'POST',
                url: ipAddress + '/users/email_login',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(postData)
            };
            $http(req).success(function (result) {
                console.log('sign up:' + result);
                if(result.errno == 1003){
                    $(".validation_msg").html("您的邮箱还没有激活, 请您去邮箱完成激活操作.");
                } else if(result.errno){
                    $(".validation_msg").html("登录失败, 请联系管理员.");
                }else {
                    if(result.length > 0) {
                        console.log(JSON.stringify(result));
                        if (result[0].u_avatar) {
                            $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='" + result[0].u_name + "' class='user-avatar-img' src='" + result[0].u_avatar + "'></div>&nbsp;<a href='#/profile?u_id=" + result[0].u_id + "'>" + result[0].u_name + "</a>");
                            $cookies.put('u_avatar', result[0].u_avatar);
                        } else {
                            $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='" + result[0].u_name + "' class='user-avatar-img' src='../../img/default_icon.png'></div>&nbsp;<a href='#/profile?u_id=" + result[0].u_id + "'>" + result[0].u_name + "</a>");
                        }
                        $cookies.put('secret', result[0].secret);
                        $cookies.put('username', result[0].u_name);
                        $cookies.put('u_id', result[0].u_id);
                        $(".header-right-logout").css("display", "block");
                        $(".header-right-login").css("display", "none");
                        $("#login-popup").css("display", "none");
                        $(".login-cover").css("display", "none");
                        $("body").css("overflow", "auto");
                        $window.location.href = "#";
                        $window.location.reload();
                    } else {
                        $(".validation_msg").html("用户名或密码不正确, 请正确输入.");
                    }
                }
            }, function (error) {
                console.log(error);
            });
        }
}]);

account.controller('EmailRecoveryPwdCtrl', ['$scope', '$cookies', '$window','$http','$css', function($scope, $cookies, $window,$http, $css){
    $scope.user = { u_email: ''};
    $scope.submit = function(){
        if ($('#register-form-email').val().length > 3) {
            $('#register-form-email').attr('disabled', "disabled");
            var postData = $scope.user;
            var req = {
                method: 'POST',
                url: ipAddress + '/users/email_recovery',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(postData)
            };
            $http(req).success(function (result) {
                if(result.errno){
                    $('.validation_msg').html("操作失败, 请联系管理员.");
                } else if(result.stage){
                    $('.validation_msg').html("邮箱不正确, 请填写正确的邮箱.");
                }else {
                    $(".validation_msg").html("重置密码邮件已经发送至您的邮箱, 请按操作完成密码设置.");
                    $('#register-form-submit').css('display','none');
                }
            }, function (error) {
                console.log(error);
            });
        }
    };
}]);

account.controller('EmailResetCtrl', ['$scope', '$cookies', '$window','$http','$css', '$routeParams', function($scope, $cookies, $window,$http, $css, $routeParams){
    $scope.user = {
        u_email: $routeParams.u_email,
        u_pwd: '',
        secret: $routeParams.secret
    };
    $scope.submit = function(){
        if($('#register-form-password').val().length < 8) {
            $('.validation_msg').html("密码不能低于8位数.");
            return;
        }
        if ($('#register-form-password').val().length > 7) {
            $('#register-form-password').attr('disabled', "disabled");
            var postData = $scope.user;
            var req = {
                method: 'POST',
                url: ipAddress + '/users/email_reset',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(postData)
            };
            $http(req).success(function (result) {
                if(result.errno){
                    $('.validation_msg').html("操作失败, 请联系管理员.");
                    $('#register-form-submit').css('display','none');
                } else {
                    $('#register-form-submit').css('display','none');
                    $('.validation_msg').html("修改成功. 点击这里<a href='#/email_login' style='color: black;'> 登录</a>");
                }
            }, function (error) {
                console.log(error);
            });
        }
    };
}]);

account.controller('LoginController', ['$scope', '$http', '$window', '$cookies','$css', function($scope, $http, $window, $cookies,$css) {
    var cookieUser = $cookies.get("username");
    if(cookieUser) {
        if($cookies.get('u_avatar')) {
            $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='"+ cookieUser +"' class='user-avatar-img' src='"+ $cookies.get('u_avatar') +"'></div>&nbsp;<a href='#/profile?u_id="+ $cookies.get('u_id') +"'>"+cookieUser +"</a>");
        } else {
            $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='"+ cookieUser +"' class='user-avatar-img' src='../../img/default_icon.png'></div>&nbsp;<a href='#/profile?u_id="+ $cookies.get('u_id') +"'>"+cookieUser +"</a>");
        }
        $(".header-right-logout").css("display", "block");
        $(".header-right-login").css("display", "none");
    } else {
        $(".header-right-logout").css("display", "none");
        $(".header-right-login").css("display", "block");
    }
    $scope.data = {
        phoneNumber: '',
        password: ''
    };
    $scope.submit = function(){
        var req = {
            method: 'POST',
            url: ipAddress + '/users/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify($scope.user)
        };
        $http(req).success(function(result){
            if(result.length > 0) {
                if(result[0].u_avatar) {
                    $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='"+ result[0].u_name +"' class='user-avatar-img' src='"+ result[0].u_avatar +"'></div>&nbsp;<a href='#/profile?u_id=" + result[0].u_id + "'>"+ result[0].u_name +"</a>");
                    $cookies.put('u_avatar', result[0].u_avatar);
                } else {
                    $("#login_username").html("<div class='user-avatar'><em class='newmsg'></em><img title='"+ result[0].u_name +"' class='user-avatar-img' src='../../img/default_icon.png'></div>&nbsp;<a href='#/profile?u_id=" + result[0].u_id + "'>"+ result[0].u_name +"</a>");
                }
                $cookies.put('secret', result[0].secret);
                $cookies.put('username', result[0].u_name);
                $cookies.put('u_id', result[0].u_id);
                $(".header-right-logout").css("display", "block");
                $(".header-right-login").css("display", "none");
                $("#login-popup").css("display", "none");
                $(".login-cover").css("display", "none");
                $("body").css("overflow","auto");
                $window.location.href="#";
                $window.location.reload();
            }else {
                $(".login-popup-form-invalid").css("display", "block");
                $scope.user = angular.copy($scope.data);
            }
        }, function(error){
            console.log(error);
        });
    };
    $scope.user = angular.copy($scope.data);
    $scope.goBack = function() {
        $window.history.back();
    }
}]);

account.controller('RegisterCtrl', ['$scope', '$cookies', '$window','$http','$css', function($scope, $cookies, $window,$http, $css){
    $scope.user = {
        username: '',
        phoneNumber: '',
        password: '',
        scCode: '',
        agreement: "checked"
    };
    $scope.goBack = function() {
        $window.history.back();
    };
    $scope.submit = function(){
        if($('#register-form-phoneNumber').val().length != 11){
            $('.validation_msg').html("请输入正确的手机号");
            return;
        }
        if($('#register-form-password').val().length < 8) {
            $('.validation_msg').html("密码长度不能低于8位");
            return;
        }
        if($scope.scCode) {
            $('.validation_msg').html("验证码不能为空");
            return;
        }
        var req = {
            method: 'GET',
            url: ipAddress + "/api/checkCode?to=" + $scope.user.phoneNumber + "&scCode=" + $scope.user.scCode,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var postData = $scope.user;
        $http(req).success(function (result) {
            if (result === "00") {
                $('.validation_msg').html("请输入正确验证码");
            } else if(result === '03'){
                $('.validation_msg').html("验证码失效.");
            }else {
                var req = {
                    method: 'POST',
                    url: ipAddress + '/users/create',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(postData)
                };
                $http(req).success(function (result) {
                    if(result.errno){
                        $('.validation_msg').html("注册失败, 请联系管理员.");
                    } else {
                        alert("注册成功, 进行登录");
                        $window.location.href = '#/login';
                    }
                }, function (error) {
                    console.log(error);
                });
            }
        }, function (error) {
            console.log(error);
        });
    };
    $scope.sendVerifyCode = function() {
        if ($('#register-form-phoneNumber').val().length == 11 && $('#register-form-password').val().length >= 8 && $('#register-form-username').val().length > 2 ) {
            var req = {
                method: 'GET',
                url: ipAddress + "/api/sendCode?to=" + $scope.user.phoneNumber,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(req).success(function (result) {
                if ("01" == result) {
                    $('.sendScCode').css("pointer-events", "none");
                    $scope.scCount = 60;
                    var scCodeBan = setInterval(function () {
                        $('.sendScCode').text("重新发送(" + $scope.scCount + "s)");
                        $scope.scCount--;
                        if ($scope.scCount == 0) {
                            clearInterval(scCodeBan);
                            $('.sendScCode').text("获取验证码");
                            $('.sendScCode').css("pointer-events", "");
                        }
                    }, 1000);
                } else if ("02" == result) {
                    alert("验证码发送频繁.")
                } else if ("03" == result) {
                    alert("发送异常, 请联系管理员.");
                } else {
                    alert("发送失败. 再试一次");
                }
            }, function (error) {
                console.log(error);
            });
        } else if ($('#register-form-phoneNumber').val().length == 0 || $('#register-form-phoneNumber').val().length != 11) {
            $('.validation_msg').html("请输入正确的手机号码");
        } else if ($('#register-form-password').val().length < 8){
            $('.validation_msg').html("密码长度不能低于8位");
        } else if ($('#register-form-username').val().length < 3){
            $('.validation_msg').html("用户名长度太短");
        }
    }
}]);

account.controller('RecoveryPwdCtrl', ['$scope', '$cookies', '$window','$http','$css', function($scope, $cookies, $window,$http, $css){
    $scope.user = {
        phoneNumber: '',
        scCode: ''
    };
    $scope.goBack = function() {
        $window.history.back();
    };
    $scope.submit = function(){
        if($scope.user.phoneNumber.length != 11){
            $('.validation_msg').html("请输入正确的手机号");
            return;
        }
        if(!$scope.user.scCode){
            $('.validation_msg').html("验证码不能为空");
            return;
        }
        var req = {
            method: 'GET',
            url: ipAddress + "/api/checkCode?to=" + $scope.user.phoneNumber + "&scCode=" + $scope.user.scCode + "&secret=true",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req).success(function (result) {
            if (result === "00") {
                alert("请输入正确验证码");
                $window.location.reload();
            } else if(result === '03'){
                alert("验证码失效.");
                $window.location.reload();
            }else {
                $window.location.href = "#/reset_pwd?u_phone_num=" + $scope.user.phoneNumber+"&secret=" + result;
            }
        }, function (error) {
            console.log(error);
        });
    };
    $scope.sendVerifyCode = function() {
        if ($('#register-form-phoneNumber').val().length == 11 ) {
            var req = {
                method: 'GET',
                url: ipAddress + "/api/sendCode?to=" + $scope.user.phoneNumber,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            $http(req).success(function (result) {

                if ("01" == result) {
                    $('.sendScCode').css("pointer-events", "none");
                    $scope.scCount = 60;
                    var scCodeBan = setInterval(function () {
                        $('.sendScCode').text("重新发送(" + $scope.scCount + "s)");
                        $scope.scCount--;

                        if ($scope.scCount == 0) {
                            clearInterval(scCodeBan);
                            $('.sendScCode').text("获取验证码");
                            $('.sendScCode').css("pointer-events", "");
                        }
                    }, 1000);

                } else if ("02" == result) {
                    alert("验证码发送频繁.")
                } else if ("03" == result) {
                    alert("发送异常, 请联系管理员.");
                } else {
                    alert("发送失败. 再试一次");
                }
            }, function (error) {
                console.log(error);
            });
        } else if ($('#register-form-phoneNumber').val().length == 0 || $('#register-form-phoneNumber').val().length != 11) {
            alert("请输入正确的手机号码");
        }
    }
}]);

account.controller('ResetPwdCtrl', ['$scope', '$cookies', '$window', '$http', '$css', '$routeParams', function($scope, $cookies, $window, $http, $css, $routeParams){
    $scope.user = {
        phoneNumber: $routeParams.u_phone_num,
        secret: $routeParams.secret,
        password: '',
        rePassword: ''
    };
    $scope.submit = function(){
        if($scope.user.password.length < 8){
            $(".reset-popup-form-invalid").css("display", "none");
            $(".reset-popup-pwd-invalid").css("display", "block");
            return;
        }
        if($scope.user.password != $scope.user.rePassword){
            $(".reset-popup-pwd-invalid").css("display", "none");
            $(".reset-popup-form-invalid").css("display", "block");
            return;
        }
        var req = {
            method: 'POST',
            url: ipAddress + '/users/updatePwd',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify($scope.user)
        };
        $http(req).success(function(result){
            if(result == '01') {
                alert("非法请求, 请稍后尝试");
            } else {
                $window.location.href = '#/reset_result';
            }
        }, function(error){
            console.log(error);
        });
    };
}]);

account.controller('ResetResultCtrl', ['$scope', '$cookies', '$window', '$http', '$css', '$routeParams', function($scope, $cookies, $window, $http, $css, $routeParams){
    $scope.back = 10;
    var resetResult = setInterval(function () {
        $('.pwd_result').text(" 密码修改完成, (" + $scope.back + "s) 跳转到登录页面.");
        $scope.back--;
        if ($scope.back == 0) {
            clearInterval(resetResult);
            $window.location.href = '#/login'
        }
    }, 1000);
}]);

