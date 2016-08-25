var app = angular.module('vetafiApp');
app.directive('vfiFooter', ['profileService', function (profileService) {
  return {
    restrict: 'E',
    templateUrl: '../templates/footer.html',
    link: function(scope, element) {
      scope.isLoggedIn = !_.isEmpty(profileService.userInfo);
    }
  };
}]);
