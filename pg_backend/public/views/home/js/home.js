'use strict';

var community = angular.module('buybsControllers');
community.controller('TripCtrl', ['$scope', '$cookies', '$window', '$http', '$css', '$sce', function($scope, $cookies, $window, $http, $css, $sce){
    $scope.checkMobile = function () {
        if($(window).width() < mobileSize - 100)
            return true;
    };
    $http({method: 'GET', url: ipAddress + '/footsteps/getFootsteps', params:{index_start: 0, count: 8, u_id: $cookies.get('u_id')}})
        .success(function(data){
            $scope.tripList = data;
        },function(error){
            $scope.error = error;
        });
    $scope.current_uID = $cookies.get('u_id');
    $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsNumber'})
        .success(function(data){
            $scope.number = data[0].number;
        },function(error){
            $scope.error = error;
        });
    $scope.isbusy = false;
    $scope.loadMore = function() {
        if($scope.tripList && $scope.number > $scope.tripList.length) {
            $scope.isbusy = true;
            $http({
                method: 'GET',
                url: ipAddress + '/footsteps/getFootstepsByTag',
                params: {index_start: $scope.tripList.length, count: 3,tag: $scope.tag, filter: $scope.filter}
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
        if(!$(window).width() < mobileSize - 100)
            $(".bgColorChange"+divkey).css("background-color",'rebeccapurple');
    };
    $scope.bgColorRemove = function (divkey) {
        if(!$(window).width() < mobileSize - 100)
            $(".bgColorChange" + divkey).css("background-color",'black');
    };
    $scope.filter = '';
    $scope.tpFilter = function(){
        $scope.searchVal = $('.search_bar').val();
        $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsByTag',
            params:{ searchVal: $scope.searchVal, u_id: $cookies.get('u_id'), index_start: 0, count: 15}
        }).success(function(data){
            if(!data.errno){
                $scope.tripList = data;
                $scope.isbusy = false;
            }
        }, function(error){
            $scope.error = error;
        });
    };
    $scope.btnFilter = function (btn) {
        $scope.filter = $("."+btn).val();
        $scope.tag = $('.search_bar').val();
        $http({method: 'GET', url: ipAddress + '/footsteps/getFootstepsByTag',
            params:{tag: $scope.tag, filter: $scope.filter, u_id: $cookies.get('u_id'), index_start: 0, count: 15}
        })
            .success(function(data){
                if(!data.errno){
                    $scope.tripList = data;
                    $scope.isbusy = false;
                }
            }, function(error){
                $scope.error = error;
            });
    };

}]);






