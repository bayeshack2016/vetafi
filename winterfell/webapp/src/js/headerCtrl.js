'use strict';
var app = angular.module('vetafiApp');
app.controller("headerCtrl", ['$scope', 'profileService', 'claimService', 'net', '$location', '$interval', 'ngDialog',
	function ($scope, profileService, claimService, net, $location, $interval, ngDialog) {
		$scope.isSignedIn = false;
		$scope.inactive = true;
		$scope.inactivityHandler = undefined;

		if (sessionStorageHelper.getPair(vfiConstants.keyUserId)) {
			net.getUserInfo().then(function(resp) {
				var user = resp.data.user;
				profileService.userInfo = user;
				net.getClaimsForUser(user.id).then(function(resp) {
					claimService.userClaims = resp.data.claims;
				});
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

		function startInactivityHandler() {
			return $interval(function() {
				if ($scope.inactive) {
					net.logout();
					profileService.clearUserInfo();
					$location.path('/');
					ngDialog.open({ template: '../templates/modals/sessionExpired.html', className: 'ngdialog-theme-default' });
				} else {
					console.log('Still active!');
					net.touchSession();
				}
				$scope.inactive = true; // reset inactivity
			}, 20 * 60 * 1000); // check every 20 minutes
		}

		//
		// Watchers
		//
		$scope.$watch(function () {
			return profileService.userInfo;
		}, function (newVal) {
			if (_.isEmpty(newVal)) {
				$scope.isSignedIn = false;
				if ($scope.inactivityHandler) {
					$interval.cancel($scope.inactivityHandler);
					$scope.inactivityHandler = undefined;
				}
			} else {
				$scope.isSignedIn = true;
				$scope.inactivityHandler = startInactivityHandler();
			}
		});

		$scope.$on('$routeChangeSuccess', function(next, current) {
			$scope.inactive = false;
		});
	}
]);
