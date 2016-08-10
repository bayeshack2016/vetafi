/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller("formCtrl", ['$scope', 'formRenderingService', 'formTemplateService', '$routeParams',
    function ($scope, formRenderingService, formTemplateService, $routeParams) {
        $scope.$watch("signature", function (newVal, oldVal) {
            console.log(newVal, oldVal);
        });

        $scope.render = function () {
            var out = [];
            for (var k in $scope.model) {
                if ($scope.model.hasOwnProperty(k)) {
                    out.push({fieldName: k, fieldValue: $scope.model[k]})
                }
            }
            formRenderingService.render($routeParams.formId, out);
        };

        $scope.onSubmit = function () {
            $scope.render();
        };

        $scope.fields = formTemplateService[$routeParams.formId];

        $scope.model = {};
    }]);