'use strict';

var buybsControllers = angular.module('buybsControllers',[]);
// var ipAddress = 'http://180.76.152.112:8090';
var ipAddress = 'http://localhost:8090';
var mobileSize = 550;
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

var allowScroll = false;
function displayPosition(miles, top){
  var maxTop = 0;
  var timer = setInterval(function(){
    window.clearInterval(timer);
    var arrayAcount = Math.floor($("#footstep-list").width()/(248*2));
    var left = 248*2;
    if($("#footstep-list").width() < mobileSize && $("#footstep-list").width() >= (mobileSize - 100)){
      arrayAcount = 2;
      left = 248*2;
      top = 80;
    }
    if($("#footstep-list").width() < (mobileSize - 100)){
      arrayAcount = 1;
      left = 336;
    }
      if ($("#footstep-list").children("#footstep-list-div").size() > 0) {
        var i = 0;
        var count = 0;
        var trigger = 0;
        var multiply = arrayAcount;
        var topPxs = [
        ];
        var balanceLength = ($('#footstep-list').width() - left*arrayAcount)/2;
        for(var h = 0; h < arrayAcount; h ++) {
          topPxs.push({"topPx": top, "leftPx": (left * h)+balanceLength});
        }
        var maxVal = 30;
        var listIndex = 0;
        $("#footstep-list").children("#footstep-list-div").each(function (index, element) {
          listIndex++;
          $(element).css({
            "top": topPxs[i].topPx + "px",
            "left": topPxs[i].leftPx + "px",
            "visibility": "visible"
          });
          if(maxTop < topPxs[i].topPx) {
            maxTop = topPxs[i].topPx;
            if (listIndex >= $("#footstep-list").children("#footstep-list-div").size() - 1) {
              $(element).css({
                "margin-bottom": "200px"
              });
            }
          }
          topPxs[i].topPx = topPxs[i].topPx + $(element).height() + 35;
          if ((index + 1) % multiply == 0) {
            i = 0;
            count++;
          } else {
            i++;
            if ((count * multiply) + multiply > $("#footstep-list").children("#footstep-list-div").size() && trigger == 0) {
              trigger++;
            }
          }
          if($("#footstep-list").children("#footstep-list-div").size() -1 == listIndex ) {
            console.log("children(#footstep-list-div) = " + $(".footstep_list_home").children("#footstep-list-div").size() + ", index = " + listIndex);
            maxVal = topPxs[i].topPx;
          }
        });
        allowScroll = true;
        $('.footstep-list_end').css('top', maxVal + 500);

      } else {
        $('.footstep-list_end').css('display', 'none');
      }
  },miles);
}
var initTimer;

buybsControllers.controller('FootDetailCtrl', ['$scope', '$routeParams', '$http', '$cookies', '$window','$css','$sce', function ($scope, $routeParams, $http, $cookies, $window,$css,$sce) {
  if($(window).width() < mobileSize - 100) {
    $scope.zoom = false;
  } else {
    $scope.zoom = true;
  }
  $scope.windowSize = $(window).width();
  $scope.trustSrc = function(src){
    return $sce.trustAsResourceUrl(src);
  };
  $scope.renderHtml = function(value) {
    return $sce.trustAsHtml(value);
  };
  $scope.publicProfile = function(fs_id) {
    $window.location.href = "#/profile/" + fs_id;
  };
  $scope.likeBtn = function(id, u_id){
    if($cookies.get('u_id') == undefined){
      $window.location.href = '#/login';
      return;
    }
    $http({method: 'GET', url: ipAddress + '/likes/search', params: {fs_id: id, u_id: $cookies.get('u_id')}})
        .success(function(data){
          if(data.count > 0) {
            var req = {
              method: 'POST',
              url: ipAddress + '/likes/delete',
              header: {
                'Content-Type': 'application/json'
              },
              data: {
                'fs_id': id,
                'u_id': $cookies.get('u_id')
              }
            };
            $http(req).success(function(result){
              $http({method: 'GET', url: ipAddress + '/likes/search', params: {fs_id: id}})
                  .success(function(data){
                    $scope.foot.likes = data.count;
                    $('.info-div-like').html("Like");
                  });

            }, function(error){
              console.log(error);
            })
          } else {
            var req = {
              method: 'POST',
              url: ipAddress + '/likes/add',
              header: {
                'Content-Type': 'application/json'
              },
              data: {
                'fs_id': id,
                'u_id': $cookies.get('u_id')
              }
            };
            $http(req).success(function(result){
              addEvent($http, $window, $cookies.get('u_id'),eLike,u_id,eFootstep,id, false);
              $http({method: 'GET', url: ipAddress + '/likes/search', params: {fs_id: id}})
                  .success(function(data){
                    $scope.foot.likes = data.count;
                    $('.info-div-like').html("Liked");
                  });
            }, function(error){
              console.log(error);
            })
    
          }
        }, function(error){
          $scope.error = error;
        });
  };
  $scope.delBtn = function(id,u_id) {
    if($cookies.get('u_id') == undefined){
      $window.location.href = '#';
      return;
    }
      var req = {
        method: 'POST',
        url: ipAddress + '/footsteps/delete',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          'fs_id': id
        }
      };
      $http(req).success(function(result){
        if(result.errno) {
          alert("操作失败, 请稍后再试");
        } else {
          alert("删除成功");
          $window.location.href = '#/';
        }
      }, function(error){
        console.log(error);
      });
  };
  $scope.stickBtn = function(id, u_id){
    if($cookies.get('u_id') == undefined){
      $window.location.href = '#/login';
      return;
    }
    $http({method: 'GET', url: ipAddress + '/sticks/search', params: {fs_id: id, u_id: $cookies.get('u_id')}})
        .success(function(data){
          if(data.length > 0 ) {
            var req = {
              method: 'POST',
              url: ipAddress + '/sticks/delete',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                'fs_id': id,
                'u_id': $cookies.get('u_id')
              }
            };
            $http(req).success(function(result){
              $(".stick_footstep").css("background-color","");
              $http({method: 'GET', url: ipAddress + '/sticks/search', params: {fs_id: id}})
                  .success(function(data){
                    $('.btnStickNum' + id).html(data.length);
                  });
            }, function(error){
              console.log(error);
            });
          } else {
            var req = {
              method: 'POST',
              url: ipAddress + '/sticks/add',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                'fs_id': id,
                'u_id': $cookies.get('u_id')
              }
            };
            $http(req).success(function(result){
              addEvent($http, $window, $cookies.get('u_id'),eCollect,u_id,eFootstep,id, false);
              $(".stick_footstep").css("background-color","#43c17e");
              $http({method: 'GET', url: ipAddress + '/sticks/search', params: {fs_id: id}})
                  .success(function(data){
                    $('.btnStickNum' + id).html(data.length);
                  });
            }, function(error){
              console.log(error);
            });
          }
        }, function(error){
          console.log(error);
        });
  };
  $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsDetail', params:{u_id: $cookies.get('u_id'), fs_id:$routeParams.footId}})
      .success(function(data){
        $scope.foot = data[0];
        $scope.checkUser = $scope.foot.u_id == $cookies.get('u_id')?true:false;

        $http({method: 'GET', url: ipAddress + '/footsteps/getRecommendations', params:{fs_country: $scope.foot.fs_country, fs_id: $scope.foot.fs_id}})
            .success(function(data){
              $scope.recList = data;
            }, function(error){
              $scope.error = error;
         });
        
      }, function(error){
        $scope.error = error;
      });
  $http({method: 'GET', url: ipAddress + '/comments/getCommentsByFSID', params:{fs_id:$routeParams.footId}})
      .success(function(data){
        $scope.comments = data;
      }, function(error){
        $scope.error = error;
      });

  $scope.loginCheck = function(){
    if($cookies.get('u_id') == undefined){
      return true;
    }
  };

  $scope.recCheck = function(fs_id) {
    $window.location.href = "#/foot/" + fs_id;
  };
  
  $scope.addComment = {
    cm_content: '',
    fs_id: '',
    u_id: $cookies.get('u_id')
  };
  $scope.submit = function(){
    if($cookies.get('u_id') == undefined){
      $window.location.href = '#/login';
      return;
    }
    $scope.addComment.fs_id = $scope.foot.fs_id;
    $scope.addComment.cm_content = CKEDITOR.instances.editor1.getData();
    var req = {
      method: 'POST',
      url: ipAddress + '/comments/add',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify($scope.addComment)
    };
    $http(req).success(function(result){
      console.log($scope.foot.u_id + " ; " + $scope.foot.fs_id);
      addEvent($http, $window, $cookies.get('u_id'),eComment,$scope.foot.u_id,eFootstep,$scope.foot.fs_id, true);
    }, function(error){
      console.log(error);
    });
  };
  $scope.index_number = 1;
  $scope.switchPic = function(pic, index_number, judge) {
    if(pic && judge) {
      $('.picture-present').attr('src',pic);
      $scope.index_number = index_number;
    }
    else {
      console.log("index_number: " + index_number);
      var maxIndex = false;
      if (pic.fs_pic2) maxIndex = 2;
      if (pic.fs_pic3) maxIndex = 3;
      if (pic.fs_pic4) maxIndex = 4;
      if (pic.fs_pic5) maxIndex = 5;
      if (pic.fs_pic6) maxIndex = 6;
      if (pic.fs_pic7) maxIndex = 7;
      if(index_number == 0 && pic.fs_pic){
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic);
      } else
      if(index_number == 1 && pic.fs_pic2){
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic2);
      } else
      if(index_number == 2 && pic.fs_pic3) {
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic3);
      } else
      if(index_number == 3 && pic.fs_pic4) {
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic4);
      } else
      if(index_number == 4 && pic.fs_pic5) {
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic5);
      } else
      if(index_number == 5 && pic.fs_pic6) {
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic6);
      } else
      if(index_number == 6 && pic.fs_pic7) {
        index_number ++;
        $('.picture-present').attr('src',pic.fs_pic7);
      } else
      if(index_number == 7 && pic.fs_pic) {
        index_number = 1;
        $('.picture-present').attr('src',pic.fs_pic);
      }
      if (index_number == maxIndex) index_number = 0;
        $scope.index_number = index_number;
    }
  };
}]);

buybsControllers.controller('ProfileController', ['$scope', '$http', '$window','$cookies','$routeParams','$css', function($scope, $http, $window, $cookies, $routeParams, $css) {
  $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsByUID', params:{u_id: $cookies.get("u_id"), index_start: 0, count: 12}})
      .success(function(data){
        $scope.tripList = data;
      },function(error){
        $scope.error = error;
      });
  $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsNumber'})
      .success(function(data){
        $scope.number = data[0].number;
      },function(error){
        $scope.error = error;
      });
  $scope.isbusy = false;
  $scope.loadMore = function() {
    if(!querySwitch)
    {
      if ($scope.tripList && $scope.number > $scope.tripList.length) {
        $scope.isbusy = true;
        $http({
          method: 'GET',
          url: ipAddress + '/footsteps/getFootstepsByUID',
          params: {index_start: $scope.tripList.length, count: 3, tag: $scope.tag, u_id: $cookies.get("u_id")}
        }).success(function (data) {
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              $scope.tripList.push(data[i]);
            }
            $scope.isbusy = false;
          }
        }, function (error) {
          $scope.error = error;
        });
      }
    } else {
      if ($scope.tripList && $scope.number > $scope.tripList.length) {
        $scope.isbusy = true;
        $http({
          method: 'GET',
          url: ipAddress + '/footsteps/getStickFootstepsByUID',
          params: {index_start: $scope.tripList.length, count: 3, tag: $scope.tag, u_id: $cookies.get("u_id")}
        }).success(function (data) {
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              $scope.tripList.push(data[i]);
            }
            $scope.isbusy = false;
          }
        }, function (error) {
          $scope.error = error;
        });
      }
    }
  };
  $scope.loginCheck = function(fs_id) {
    $window.location.href = "#/foot/" + fs_id;
  };
  $scope.bgColorChange = function (divkey) {
    $(".bgColorChange" + divkey).css("background-color",'rebeccapurple');
  };
  $scope.bgColorRemove = function (divkey) {
    $(".bgColorChange" + divkey).css("background-color",'black');
  };
  $scope.createBtn = function(){
    $window.location.href = "#/tool/pixel";
  };
  $scope.editProfileBtn = function(){
    $window.location.href = "#/profile/edit";
  };
  $http({method: 'GET', url: ipAddress + '/users/getUserById', params:{u_id:$cookies.get('u_id'),secret:$cookies.get('secret')}})
      .success(function(data){
        $scope.user = data[0];
      }, function(error){
        $scope.error = error;
      });
  $http({method: 'GET', url: ipAddress + '/users/getUserDetail', params:{u_id: $routeParams.u_id,secret:$cookies.get('secret')}})
      .success(function(data){
        $scope.userProfile = data;
      }, function(error){
        $scope.error = error;
      });
  var querySwitch = false;
  $scope.profileFootsteps = function(u_id) {
    querySwitch = false;
    $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsByUID', params:{u_id: $cookies.get("u_id"), index_start: 0, count: 12}})
        .success(function(data){
          $scope.tripList = data;
        },function(error){
          $scope.error = error;
        });
      $(".trip_list").css("display", "block");
      $('.follow-list').css("display",'none');
  };
  $scope.profileSticks = function(u_id) {
    querySwitch = true;
    $scope.val = 2;
    $scope.isbusy = false;
    allowScroll = true;
    $http({method: 'GET', url: ipAddress + '/footsteps/getStickFootstepsByUID', params:{u_id: u_id, index_start: 0, count: 12}})
        .success(function(data){
          $scope.tripList = data;
        }, function(error){
          $scope.error = error;
        });
    $(".trip_list").css("display", "block");
    $('.follow-list').css("display",'none');
  };
  $scope.profileFollows = function(u_id) {
    $http({method: 'GET', url: ipAddress + '/followers/getFollowsByUID', params:{u_id: u_id}})
        .success(function(data){
          $scope.results = data;
          $(".trip_list").css("display", "none");
          $('.follow-list').css("display",'block');
        }, function(error){
          $scope.error = error;
        });
  };
  $scope.profileFans = function(u_id) {
    $http({method: 'GET', url: ipAddress + '/followers/getFansByUID', params:{u_id: u_id}})
        .success(function(data){
          $scope.results = data;
          $(".trip_list").css("display", "none");
          $('.follow-list').css("display",'block');
        }, function(error){
          $scope.error = error;
        });
  };

  $http({method: 'GET', url: ipAddress + '/notifications/getNotifications', params:{u_id: $cookies.get('u_id'), index_start: 0, count: 1}})
      .success(function(data){
        $scope.notifications = data;
      },function(error){
        $scope.error = error;
      });
  
  $scope.loadMsgMore = function () {
    $http({
      method: 'GET',
      url: ipAddress + '/notifications/getNotifications',
      params: {u_id: $cookies.get('u_id'), index_start: $scope.notifications.list.length, count: 1}
    }).success(function (data) {
      if (data.list.length > 0) {
        for (var i = 0; i < data.list.length; i++) {
          $scope.notifications.list.push(data.list[i]);
        }
      }
    }, function (error) {
      $scope.error = error;
    });
  };
  
  

  $scope.deleteMsg = function (nf_id, $index) {

    $scope.notifications.list.splice($index,1);
    $scope.notifications.count = $scope.notifications.count - 1;

    var req = {
      method: 'POST',
      url: ipAddress + '/notifications/del',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        'nf_id': nf_id
      }
    };
    $http(req).success(function(result){
    }, function(error){
      console.log(error);
    })
    
  };

  
  
}]);

buybsControllers.controller('ProfilePubController', ['$scope', '$http', '$window','$cookies','$routeParams','$css', function($scope, $http, $window, $cookies, $routeParams, $css) {
  $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsByUID', params:{u_id: $cookies.get("u_id"), index_start: 0, count: 12}})
      .success(function(data){
        $scope.tripList = data;
      },function(error){
        $scope.error = error;
      });
  $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsNumber'})
      .success(function(data){
        $scope.number = data[0].number;
      },function(error){
        $scope.error = error;
      });
  $scope.isbusy = false;
  $scope.loadMore = function() {
      if ($scope.tripList && $scope.number > $scope.tripList.length) {
        $scope.isbusy = true;
        $http({
          method: 'GET',
          url: ipAddress + '/footsteps/getFootstepsByUID',
          params: {index_start: $scope.tripList.length, count: 3, tag: $scope.tag, u_id: $cookies.get("u_id")}
        }).success(function (data) {
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              $scope.tripList.push(data[i]);
            }
            $scope.isbusy = false;
          }
        }, function (error) {
          $scope.error = error;
        });
      }
  };

  $scope.loginCheck = function(fs_id) {
    $window.location.href = "#/foot/" + fs_id;
  };
  $scope.bgColorChange = function (divkey) {
    $(".bgColorChange" + divkey).css("background-color",'rebeccapurple');
  };
  $scope.bgColorRemove = function (divkey) {
    $(".bgColorChange" + divkey).css("background-color",'black');
  };
  $http({method: 'GET', url: ipAddress + '/users/getUserById', params:{u_id:$cookies.get('u_id'),secret:$cookies.get('secret')}})
      .success(function(data){
        $scope.user = data[0];
      }, function(error){
        $scope.error = error;
      });
}]);

buybsControllers.controller('pixelController', ['$scope', '$cookies', '$window', '$http','$css', function($scope, $cookies, $window, $http, $css){

  if(!getCookie('u_id')){
    window.location.href = '#/login';
  }
  
  $scope.closeBtn = function() {
    $window.location.href = '#/profile?u_id=' + $cookies.get('u_id');
  };
  $scope.footstep = {
    fs_pic : '',
    fs_des : '',
    fs_from : '',
    u_id : $cookies.get('u_id'),
    fs_bigImg : '',
    fs_smallImg : '',
    fs_create_time : '',
    fs_update_time : '',
    fs_status : '',
    fs_pic2 : '',
    fs_pic3 : '',
    fs_pic4 : '',
    fs_pic5 : '',
    fs_pic6 : '',
    fs_pic7 : '',
    fs_pic8 : '',
    fs_disPic: '',
    fs_disPic2: '',
    fs_disPic3: '',
    fs_desPic4: '',
    fs_price: '',
    fs_sales: '',
    fs_commission: '',
    fs_promo: '',
    fs_discount: '',
    fs_platform: '',
    fs_country: '',
    fs_city: '',
    widthPixel : '',
    heightPixel : '',
    rotateDegree : '',
    waterMark: '',
    color: '',
    secret : $cookies.get('secret')
  };
  $scope.submit = function() {
    if($cookies.get('u_id') == undefined){
      $window.location.href = '#/email_login';
      return;
    }
    if($scope.footstep.fs_country == '' || $scope.footstep.fs_city == ''){
      $(".topic_add_msg").html("国家或者城市不能为空");
      return;
    }
    $scope.footstep.fs_des = CKEDITOR.instances.editor1.getData();
    if($scope.footstep.fs_des == ''){
      $(".topic_add_msg").html("既然来了， 动动手添加一些介绍吧. ");
      return;
    }
    console.log($scope.footstep.fs_des);
    var req = {
      method: 'POST',
      url: ipAddress + '/footsteps/create',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify($scope.footstep)
    };
    $http(req).success(function(result){
      if(result.errno){
        alert("创建失败, 请稍后再试.");
      } else {
        $window.location.href = '#/profile?u_id=' + $cookies.get('u_id');
      }
    }, function(error){
      console.log(error);
    });
  };
  var progress = 1;
  var progressBar = function(){
    progress += 1;
    if(progress < 99) {
      $('#myBar').width(progress + "%");
      $('#myBar').text(progress + "%");
    } else {
      clearInterval(progressBar);
    }
  };
  $scope.uploadFile = function(file, num) {
    progress = 1;
    setInterval(progressBar, 100);
    var file_data = $(file).prop('files')[0];
    var form_data = new FormData();
    form_data.append('u_id', $cookies.get('u_id'));
    form_data.append('widthPixel', $scope.footstep.widthPixel);
    form_data.append('heightPixel', $scope.footstep.heightPixel);
    form_data.append('rotateDegree', $scope.footstep.rotateDegree);
    form_data.append('waterMark', $scope.footstep.waterMark);
    form_data.append('color', $scope.footstep.color);
    form_data.append("file", file_data);
    $.ajax({
      url: ipAddress + "/pic/uploadPhotos",
      contentType: false,
      data: form_data,
      processData: false,
      cache: false,
      type: "POST",
      success: function (res) {
        progress = 100;
        $('#myBar').width("100%");
        $('#myBar').text('上传完成!');
        $(file).parent().css("min-height", '0px');
        $('.present_picture').attr('src', res.originalImg);
        $('.footstep_pic' + num).attr('src', res.originalImg);
        if(num == 0) {
          $scope.footstep.fs_pic = res.originalImg;
          $scope.footstep.fs_disPic = res.customImg;
        }
        if(num == 2) {
          $scope.footstep.fs_pic2 = res.originalImg;
          $scope.footstep.fs_disPic2 = res.customImg;
        }
        if(num == 3) {
          $scope.footstep.fs_pic3 = res.originalImg;
          $scope.footstep.fs_disPic3 = res.customImg;
        }
        if(num == 4) {
          $scope.footstep.fs_pic4 = res.originalImg;
          $scope.footstep.fs_disPic4 =res.customImg;
        }
        if(num == 5) $scope.footstep.fs_pic5 = res.originalImg;
        if(num == 6) $scope.footstep.fs_pic6 = res.originalImg;
        if(num == 7) $scope.footstep.fs_pic7 = res.originalImg;
        if(num == 8) $scope.footstep.fs_pic8 = res.originalImg;
        $(file).css("display", "none");
        $('.footstep_pic_btn' + num).css("display", 'none');
        $('.footstep_pic' + num).css('display', 'inline-block');
      },
      error: function(res) {
        $('#myBar').text('上传失败!');
      }
    });
  };
  $scope.switchPic = function(pic) {
    $('.present_picture').attr('src', pic);
  };
}]);

buybsControllers.controller('ProfileEditController', ['$scope', '$cookies', '$window', '$http','$css', function($scope, $cookies, $window, $http, $css){
  $scope.closeBtn = function() {
    $window.location.href = '#/profile?u_id=' + $cookies.get('u_id');
  };
  $http({method: 'GET', url: ipAddress + '/users/getUserById', params:{u_id:$cookies.get('u_id'),secret:$cookies.get('secret')}})
      .success(function(data){
        $scope.user = data[0];
      }, function(error){
        $scope.error = error;
      });
  $scope.updateSubmit = function() {
    var reqData = {
      u_name: $scope.user.u_name,
      u_avatar: $scope.user.u_avatar,
      u_link: $scope.user.u_link,
      u_slogan: $scope.user.u_slogan,
      u_id: $scope.user.u_id,
      secret: $cookies.get('secret')
    };
    var req = {
      method: 'POST',
      url: ipAddress + '/users/update',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(reqData)
    };
    $http(req).success(function(result){
      if(result.errno){
        alert("更新失败, 请稍后再试.");
      } else {
        $window.location.href = '#/profile?u_id=' + $cookies.get('u_id');
      }
    }, function(error){
      console.log(error);
    });
  };
  $scope.uploadAvatar = function(file) {
    var file_data = $(file).prop('files')[0];
    var form_data = new FormData();
    form_data.append('u_id', $cookies.get('u_id'));
    form_data.append("file", file_data);
    $.ajax({
      url:  ipAddress + "/api/uploadAvatar",
      contentType: false,
      data: form_data,
      processData: false,
      cache: false,
      type: "POST",
      success: function (res) {
        $('.profile_top_info-avatar-div_img').attr('src', res);
        $scope.user.u_avatar = res;
      }
    });
  };
}]);

buybsControllers.controller('headerController', ['$scope', '$cookies', '$window','$http', function($scope, $cookies, $window,$http){
  $scope.homepageBtn = function() {
    $window.location = '#/foot/';
  };
  
  $scope.logout = function(){
    $cookies.remove('username');
    $cookies.remove('u_id');
    $cookies.remove('u_avatar');
    $cookies.remove('secret');
    $window.location.href = '#';
    $window.location.reload();
  };
  
  // $http({method: 'GET', url: ipAddress + '/notifications/getNotifications', params:{u_id: $cookies.get('u_id')}})
  //     .success(function(data){
  //       $scope.notifications = data;
  //       var newmsgShow = false;
  //       $scope.notifications.forEach(function (item, index) {
  //         for(var key in item) {
  //           if(key === 'nf_status' && item[key] == 0){
  //             newmsgShow = true;
  //             return;
  //           }
  //         }
  //       });
  //       if(newmsgShow) {
  //         $('.newmsg').css("display","block");
  //       }else{
  //         $('.newmsg').css("display","none");
  //       }
  //     },function(error){
  //       $scope.error = error;
  //     });
}]);

buybsControllers.controller('MessageController', ['$scope', '$cookies', '$window', '$http', '$css', function($scope, $cookies, $window, $http, $css){
  $scope.message = {
    u_id: $cookies.get('u_id'),
    m_content: ''
  };
  $scope.submit = function(){
    var req = {
      method: 'POST',
      url: ipAddress + '/messages/add',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify($scope.message)
    };
    $http(req).success(function(result){
      alert("留言发送成功.");
      $window.history.back();
    }, function(error){
      console.log(error);
    });
  };
  $scope.closeTopic = function() {
    $window.history.back();
  };
}]);
