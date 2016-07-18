'use strict';
var app = angular.module('vetafiApp');
app.controller("headerCtrl", ['$scope', 'profileService', 'net',
	function ($scope, profileService, net) {
		$scope.isLoggedIn = false;

		if (sessionStorageHelper.getPair(vfiConstants.keyUserId)) {
			net.getUserInfo().then(function(resp) {
				var user = resp.data.user;
				profileService.userInfo = user;
			});
		}

		//
		// Watchers
		//
		$scope.$watch(function () {
			return profileService.userInfo;
		}, function (newVal) {
			if (_.isEmpty(newVal)) {
				$scope.isLoggedIn = false;
			} else {
				$scope.isLoggedIn = true;
			}
		});
	}
]);
