/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller("formCtrl", ['$scope', function($scope) {
    $scope.$watch("signature", function(newVal, oldVal) {
        console.log(newVal, oldVal);
    });
}]);