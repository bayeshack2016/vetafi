'use strict';
var app = angular.module('vetafiApp');
app.controller("headerCtrl", ['$scope', 'profileService', 'net', '$location',
	function ($scope, profileService, net, $location) {
		$scope.isSignedIn = false;

		if (sessionStorageHelper.getPair(vfiConstants.keyUserId)) {
			net.getUserInfo().then(function(resp) {
				var user = resp.data.user;
				profileService.userInfo = user;
			});
		}

		//
		// Header Menu
		//
		$scope.menuToggled = false;
		$scope.onToggleMenu = function() {
			$scope.menuToggled = !$scope.menuToggled;
		};

		$scope.closeThisMenu = function () {
        $scope.menuToggled = false;
    }

		$scope.onClickProfileOption = function() {
			$scope.menuToggled = false;
			$location.path('/profile');
		};

		$scope.onClickLogoutOption = function() {
			$scope.menuToggled = false;
			net.logout().then(function(resp) {
				profileService.clearUserInfo();
				if (resp.status == 200) {
					$location.path('/');
				}
			});
		};

		//
		// Watchers
		//
		$scope.$watch(function () {
			return profileService.userInfo;
		}, function (newVal) {
			if (_.isEmpty(newVal)) {
				$scope.isSignedIn = false;
			} else {
				$scope.isSignedIn = true;
			}
		});
	}
]);
