/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller("formCtrl", ['$scope', 'formRenderingService', function($scope, formRenderingService) {
    $scope.$watch("signature", function(newVal, oldVal) {
        console.log(newVal, oldVal);
    });

    $scope.render = function() {
        formRenderingService.render('VBA-21-0966-ARE', [{fieldName: 'veteran_first_name', fieldValue: 'jeff'}]);
    }
}]);