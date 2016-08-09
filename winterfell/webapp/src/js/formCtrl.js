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
        var out = [];
        for (var k in $scope.model) {
            if ($scope.model.hasOwnProperty(k)) {
                out.push({fieldName: k, fieldValue: $scope.model[k]})
            }
        }
        formRenderingService.render('VBA-21-0966-ARE', out);
    };

    $scope.onSubmit = function() {
        $scope.render();
    };

    $scope.fields = [
        {
            key: 'veteran_first_name',
            type: 'input',
            templateOptions: {
                label: 'Name',
                placeholder: 'Name'
            }
        }
    ];

    $scope.model = {};
}]);