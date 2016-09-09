var app = angular.module('vetafiApp');
app.directive('vfiFooter', ['Profile', function (Profile) {
  return {
    restrict: 'E',
    templateUrl: '../templates/footer.html',
    link: function(scope, element) {
      scope.isLoggedIn = Profile.isSetUser();
    }
  };
}]);
