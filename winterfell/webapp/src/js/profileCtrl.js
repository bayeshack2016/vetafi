'use strict';
var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', '$window', 'Profile', 'claimService', 'net', 'strings', '$uibModal', '$state',
  function($scope, $location, $window, Profile, claimService, net, strings, $uibModal, $state) {
    $scope.ranks = strings.ranks;
    $scope.branches = strings.branches;
    $scope.insigniaUrls = {
      airforce: '../icons/us_insignia_airforce.svg',
      army: '../icons/us_insignia_army.svg',
      coastguard: '../icons/us_insignia_coastguard.svg',
      marine: '../icons/us_insignia_marine.svg',
      navy: '../icons/us_insignia_navy.svg'
    };

    var tabValues = {
      military: 'military',
      fileClaims: 'claims',
      settings: 'settings'
    };
    $scope.currentTab = tabValues.military;
    $scope.userInfo = {};
    $scope.claims = [];
    $scope.militaryInfo = [
      {
        rank: 'lieutenant',
        branch: 'navy',
        yearStart: '2013',
        yearEnd: '2015'
      },
      {
        rank: 'captain',
        branch: 'army',
        yearStart: '2012',
        yearEnd: '2013'
      }
    ];

    $scope.clickEdit = function() {
      console.log('Edit User Information');
    };

    $scope.clickChangePic = function() {
      console.log('Change Profile Picture');
    };

    $scope.clickAddMilitary = function() {
      console.log('Edit Military Information');
    };

    $scope.clickChangeEmail = function() {
      console.log('Change Email');
    };

    $scope.clickChangePassword = function() {
      $uibModal.open({ templateUrl: 'templates/modals/changePassword.html', windowClass: 'ngdialog-theme-default' });
    };

    $scope.clickLinkIdMe = function() {
      // Redirect to IdMe auth page, which will redirect to the specified uri setup with IdMe.
      $window.location.href = net.getAuthIdMeUrl();
    };

    $scope.clickLogout = function() {
      net.logout().then(function(resp) {
        Profile.logout();
        if (resp.status == 200) {
          $location.path('/');
        }
      });
    };

    $scope.clickDeleteAccount = function() {
      net.deleteUserAccount().then(function(resp) {
        Profile.logout();
        if (resp.status == 200) {
          $location.path('/');
        }
      });
    };

    $scope.clickClaimDiscard = function(claimId) {
      claimService.removeClaim(claimId);
    };
  }
]);
