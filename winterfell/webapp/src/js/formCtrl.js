/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formRenderingService', 'formTemplateService', 'formService', '$stateParams',
    function ($scope, $filter, $rootScope, formRenderingService, formTemplateService, formService, $stateParams) {
        $scope.$watch('signature', function (newVal, oldVal) {
            console.log(newVal, oldVal);
            if (newVal) {
                $scope.model['signature'] = newVal.dataUrl;
            }
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
            formRenderingService.render($stateParams.formId, out);
        };

        $scope.onSubmit = function () {
            console.log($scope.fields);
            console.log($scope.model);

            //$scope.render();
        };

        $scope.save = function () {
            formService.save($stateParams.claimId, $stateParams.formId, $scope.model, function(err, response) {
                console.log(err, response);
            })
        };

        $scope.model = {};
        $scope.fields = formTemplateService[$stateParams.formId].fields;

        for (var i=0; i<$scope.fields.length; i++) {
            if ($scope.fields[i].key.indexOf('date_signed') !== -1) {
                $scope.model[$scope.fields[i].key] = currentDate();
            }
        }
    }]);

