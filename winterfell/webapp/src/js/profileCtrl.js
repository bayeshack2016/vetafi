var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', 'profileService', 'net', 'modalService', 'strings',
  function($scope, $location, profileService, net, modalService, strings) {
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
      fileClaims: 'file_claims',
      settings: 'settings'
    };
    $scope.currentTab = tabValues.military;
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

    $scope.clickMilitaryTab = function() {
      $location.path('/profile/military');
    };

    $scope.clickFileClaimsTab = function() {
      $location.path('/profile/file_claims');
    };

    $scope.clickSettingsTab = function() {
      $location.path('/profile/settings');
    };


    //
    // Old Stuff
    //
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

    $scope.$watch(function() {
      return $location.path();
    }, function(newVal, oldVal) {
      if (newVal == '/profile/' + tabValues.military) {
        $scope.currentTab = tabValues.military;
      } else if (newVal == '/profile/' + tabValues.fileClaims) {
        $scope.currentTab = tabValues.fileClaims;
      } else if (newVal == '/profile/' + tabValues.settings) {
        $scope.currentTab = tabValues.settings;
      } else {
        $scope.currentTab = tabValues.military;
      }
    });

  }
]);
