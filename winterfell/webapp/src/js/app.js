/**
 * Main AngularJS Web Application Declaration
 */
'use strict';

var app = angular.module('vetafiApp', [
    'ngRoute',
    'angular-click-outside',
    'ngDialog'
]);

/**
 * Configure routes
 */
app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "templates/home.html"
    }).when("/faq", {
        templateUrl: "templates/faq.html"
    })

    // Profile Pages
    .when("/profile", {
        templateUrl: "templates/profile.html"
    }).when("/profile/:subPage", {
        templateUrl: "templates/profile.html"
    })

    // File Claims Pages
    .when("/tos", {
        templateUrl: "templates/tos.html"
    }).when("/start-file-claim", {
        templateUrl: "templates/startFileClaim.html"
    }).otherwise({
        redirectTo: '/'
    });
});
