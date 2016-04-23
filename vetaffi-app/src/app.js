/**
 * Main AngularJS Web Application
 */
'use strict';

var app = angular.module('vetaffiApp', [
  'ngRoute'
]);

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
