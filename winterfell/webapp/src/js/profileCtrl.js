var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', 'profileService', 'claimService', 'net', 'strings', 'ngDialog',
  function($scope, $location, profileService, claimService, net, strings, ngDialog) {
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

    $scope.clickClaimEdit = function() {
      $location.path('/claim/select-forms');
    };

    $scope.clickClaimDiscard = function(claimId) {
      claimService.removeClaim(claimId);
    };

    $scope.clickClaimView = function(claimId) {
      $location.path('/claim/' + claimId);
    };

    function updateClaims() {
      _.map($scope.claims, function(claim) {
        if (!claim.actionMessage) {
          if (claim.state == 'incomplete') {
            claim.dateMessage = 'Last modified on ' + claim.updatedAt;
          } else if (claim.state == 'submitted') {
            claim.dateMessage = 'Submitted on ' + claim.updatedAt;
          } else if (claim.state == 'processed') {
            claim.dateMessage = 'Processed by the VA on ' + claim.updatedAt;
          }
        }
      });
    }

    //
    // Watchers
    //
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

    $scope.$watch(function () {
      return claimService.userClaims;
    }, function (newVal) {
      $scope.claims = claimService.userClaims;
      updateClaims();
    });

  }
]);
