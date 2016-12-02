var app = angular.module('vetafiApp');
app.directive('vfiFooter', ['Profile', function (Profile) {
  return {
    restrict: 'E',
    templateUrl: '../templates/footer.html',
    link: function(scope) {
      scope.isLoggedIn = Profile.isSetUser();
    }
  };
}]);
