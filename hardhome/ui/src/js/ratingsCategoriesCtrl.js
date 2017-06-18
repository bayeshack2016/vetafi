'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsCategoriesCtrl', ['$scope', 'ratingsConfigsService',
    function($scope, ratingsConfigs) {
        console.log(ratingsConfigs);
        $scope.category = ratingsConfigs;
        $scope.breadcrumbs = [];
        $scope.gotoCategory = function(category) {
            $scope.breadcrumbs.push(category);
            $scope.category = category;
            console.log(category)
        }

        $scope.back = function() {
            if ($scope.breadcrumbs.length > 0) {
                $scope.category = $scope.breadcrumbs.pop()
            }
            console.log($scope.category)
        }
    }]
)
