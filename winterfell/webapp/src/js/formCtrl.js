/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller("formCtrl", ['$scope', '$filter', '$rootScope', 'formRenderingService', 'formTemplateService', 'formService', '$routeParams',
    function ($scope, $filter, $rootScope, formRenderingService, formTemplateService, formService, $routeParams) {
        $scope.$watch("signature", function (newVal, oldVal) {
            console.log(newVal, oldVal);
        });

        function currentDate() {
            return $filter('date')(new Date(), 'MM/dd/yyyy');
        }

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
            console.log($scope.fields);
            console.log($scope.model);

            //$scope.render();
        };

        $scope.save = function () {
            formService.save($routeParams.claimId, $routeParams.formId, $scope.model, function(err, response) {
                console.log(err, response);
            })
        };

        $scope.model = {};
        $scope.fields = formTemplateService[$routeParams.formId];

        for (var i=0; i<$scope.fields.length; i++) {
            if ($scope.fields[i].key.indexOf('date_signed') !== -1) {
                $scope.model[$scope.fields[i].key] = currentDate();
            }
        }
    }]);

