var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', 'profileService', 'net', 'modalService',
  function($scope, $location, profileService, net, modalService) {
    $scope.insigniaUrls = {
      airforce: '../icons/us_insignia_airforce.svg',
      army: '../icons/us_insignia_army.svg',
      coastguard: '../icons/us_insignia_coastguard.svg',
      marine: '../icons/us_insignia_marine.svg',
      navy: '../icons/us_insignia_navy.svg'
    };

    $scope.branchStrings = {
      airforce: 'United States Department of the Air Force',
      army: 'United States Department of the Army',
      coastguard: 'United States Coast Guard',
      marine: 'United States Marine Corps',
      navy: 'United States Department of the Navy'
    }

    $scope.rankStrings = {
      captain: 'Captain',
      lieutenant: 'Lieutenant Commander',
      vice_admiral: 'Vice Admiral'
    };

    $scope.userInfo = {};
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
    $scope.claims = [];

    $scope.clickEdit = function() {
      debugger;
      modalService.activateModal();
    };

    $scope.clickChangePic = function() {
      debugger;
      modalService.activateModal();
    };

    $scope.clickAddMilitary = function() {
      debugger;
      modalService.activateModal();
    };

    $scope.clickLogout = function() {
      net.logout().then(function(resp) {
        sessionStorageHelper.removePair(vfiConstants.keyUserId);
        profileService.userInfo = {};
        if (resp.status == 200) {
          $location.path('/');
        }
      });
    };

    $scope.clickDeleteAccount = function() {
      net.deleteUserAccount().then(function(resp) {
        debugger;
        sessionStorageHelper.removePair(vfiConstants.keyUserId);
        profileService.userInfo = {};
        if (resp.status == 200) {
          $location.path('/');
        }
      });
    };
  }
]);
