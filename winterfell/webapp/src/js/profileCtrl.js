var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', 'profileService', 'net', 'strings', 'ngDialog',
  function($scope, $location, profileService, net, strings, ngDialog) {
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
      $location.path('/profile/' + tabValues.military);
    };

    $scope.clickFileClaimsTab = function() {
      $location.path('/profile/' + tabValues.fileClaims);
    };

    $scope.clickSettingsTab = function() {
      $location.path('/profile/' + tabValues.settings);
    };

    $scope.clickEdit = function() {
      debugger;
    };

    $scope.clickChangePic = function() {
      debugger;
    };

    $scope.clickAddMilitary = function() {
      debugger;
    };

    $scope.clickChangeEmail = function() {
      debugger;
    }

    $scope.clickChangePassword = function() {
      ngDialog.open({ template: '../templates/modals/changePassword.html', className: 'ngdialog-theme-default' });
    }

    $scope.clickLogout = function() {
      net.logout().then(function(resp) {
        profileService.clearUserInfo();
        if (resp.status == 200) {
          $location.path('/');
        }
      });
    };

    $scope.clickDeleteAccount = function() {
      net.deleteUserAccount().then(function(resp) {
        profileService.clearUserInfo();
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
