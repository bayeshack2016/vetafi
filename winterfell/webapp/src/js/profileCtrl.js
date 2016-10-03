'use strict';
var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', '$window', 'Profile', 'claimService', 'net', '$uibModal', '$state',
  function($scope, $location, $window, Profile, claimService, net, $uibModal, $state) {

    $scope.user = Profile.user.user;
    $scope.claims = [];
    // $scope.claims = [
    //   {
    //     id: '1234',
    //     date: '3/16/2016',
    //     state: 'incomplete',
    //     formIds: ['VBA-21-0966-ARE']
    //   },
    //   {
    //     id: '5678',
    //     date: '3/17/2015',
    //     state: 'submitted',
    //     formIds: ['VBA-21-0966-ARE', 'VBA-21-0967-ARE']
    //   }
    // ];

    function createHeaderString(claim) {
      if (claim.state == 'incomplete') {
        return 'Started (incomplete)';
      } else if (claim.state == 'submitted') {
        return 'Submitted';
      }
    }

    function init() {
      for (var i = 0; i < $scope.claims.length; i++) {
        $scope.claims[i].header = createHeaderString($scope.claims[i]);
      }
    }
    init();

    $scope.clickEditInfo = function() {
      console.log('Edit User Information');
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
