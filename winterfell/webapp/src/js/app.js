/**
 * Main AngularJS Web Application Declaration
 */
'use strict';

var app = angular.module('vetafiApp', [
    'ngRoute'
]);

/**
 * Configure routes
 */
app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "templates/home.html"
    }).when("/faq", {
        templateUrl: "templates/faq.html"
    }).when("/profile/*", {
        templateUrl: "templates/profile.html"
    }).when("/tos", {
        templateUrl: "templates/tos.html"
    }).when("/start-file-claim", {
        templateUrl: "templates/startFileClaim.html"
    }).otherwise({
        redirectTo: '/'
    });
});
