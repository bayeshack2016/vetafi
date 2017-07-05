'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsHomeCtrl', ['$scope', 'ratingsConfigsService', '$stateParams', '$state', 'conditions',
    function ($scope, ratingsConfigs, $stateParams, $state, conditions) {
        $scope.conditions = conditions;

        $scope.addCondition = function() {
            $state.go('root.ratingsCategories', {path: ''})
        }
    }]
);
