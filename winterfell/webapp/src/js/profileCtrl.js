'use strict';
var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', '$window', 'Profile', 'claimService', 'net', '$uibModal', '$state',
  function($scope, $location, $window, Profile, claimService, net, $uibModal, $state) {

    $scope.user = Profile.user.user;
    $scope.claims = []; // list of user's claims
    // Every claim has the following:
    // * claimId
    // * date of submission or last modified
    // * claim state (incomplete, submitted)
    // * list of formIds

    // $scope.claims = [ // TODO: have server return lastModifiedAt date and list of formIds per claim
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
      var newScope = $scope.$new(true);
      newScope.headline = "Edit General Information";
      newScope.user = $scope.user;
      $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/editProfile.html',
        windowClass: 'ngdialog-theme-default'
      });
    };

    $scope.clickChangePassword = function() {
      var newScope = $scope.$new(true);
      newScope.headline = "Change Password";
      $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/changePassword.html',
        windowClass: 'ngdialog-theme-default'
      });
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
      var newScope = $scope.$new(true);
      newScope.headline = "Delete Account";
      newScope.message = "Are you sure you want to delete your account? All your saved personal information will be lost.";
      newScope.choice = 'warning';
      newScope.continueText = 'Delete';
      var modal = $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/twoButtonModal.html',
        windowClass: 'ngdialog-theme-default'
      });
      modal.result.then(function() {
        net.deleteUserAccount().then(function(resp) {
          Profile.logout();
          if (resp.status == 200) {
            $location.path('/');
          }
        });
      });
    };

    $scope.clickClaimDiscard = function(claimId) {
      claimService.removeClaim(claimId);
    };
  }
]);
