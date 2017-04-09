var app = angular.module('vetafiApp');
app.controller('supportCtrl', ['$scope', 'Profile', function($scope, Profile) {
  $scope.user = Profile.getUser() ? Profile.getUser() : undefined;
  $scope.userName = $scope.user && $scope.user.firstname ? $scope.user.firstname + " " + $scope.user.lastname : undefined;
  $scope.userEmail = $scope.user ? $scope.user.email : undefined;
}]);
