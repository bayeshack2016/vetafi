'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsHomeCtrl', ['$scope',
    'ratingsConfigsService',
    '$stateParams',
    '$state',
    'conditions',
    'ratingService',
    function ($scope, ratingsConfigs, $stateParams, $state, conditions, ratingService) {
        $scope.conditions = conditions;

        $scope.userRating = ratingService.getUserRating();

        console.log(ratingService.getUserRating());

        $scope.addCondition = function() {
            $state.go('root.ratingsCategories', {path: ''})
        };

        $scope.removeSelection = function(selection) {
            ratingService.removeSelection(selection);
        }
    }]
);
