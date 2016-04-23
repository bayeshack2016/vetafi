/**
 * Main AngularJS Web Application
 */
'use strict';
angular.module('formData', []);
var app = angular.module('vetaffiApp', [
  'ngRoute',
  'formData'
]);

app.controller('formController', ['formData', function($scope, formData) {


}]);

/**
  * Configure the Routes
*/
app.config(['$routeProvider', function ($routeProvider) {
$routeProvider.when("/", {
    templateUrl: "templates/intro.tpl.html"
  });
  $routeProvider.when("/signin", {
    templateUrl: "templates/signin.tpl.html"
  });

  $routeProvider.otherwise({
    redirectTo: '/',
  });
}]);
