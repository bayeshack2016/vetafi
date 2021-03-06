'use strict';
var app = angular.module('vetafiApp');
app.controller("headerCtrl",
  ['$scope', 'Profile', 'claimService', 'net', '$window', '$interval', '$uibModal',
    function ($scope, Profile, claimService, net, $window, $interval, $uibModal) {
      $scope.isSignedIn = Profile.isSetUser();

      //
      // Header Menu
      //
      $scope.menuToggled = false;
      $scope.onToggleMenu = function () {
        $scope.menuToggled = !$scope.menuToggled;
      };

      $scope.closeThisMenu = function () {
        $scope.menuToggled = false;
      };

      function ExpirationChecker() {
        this.active = false;
      }

      ExpirationChecker.prototype.checkSessionExpiration = function () {
        if (this.active) {
          return;
        }

        var that = this;
        net.touchSession().then(function success() {
        }, function failure() {
          that.active = true;
          var newScope = $scope.$new(true);
          newScope.headline = "Session Expired";
          newScope.message = "For security reasons, your session has expired due to inactivity. Please log back in to continue your work.";
          var modal = $uibModal.open({
            scope: newScope,
            templateUrl: 'templates/modals/oneButtonModal.html',
            windowClass: 'ngdialog-theme-default'
          });
          modal.result.then(function() {
            that.active = false;
            $window.location.href = '/login';
          });
        });
      };

      var expirationChecker = new ExpirationChecker();

      $interval(function() {
        expirationChecker.checkSessionExpiration();
      }, 20 * 60 * 1000); // check every 20 minutes
    }]
);
