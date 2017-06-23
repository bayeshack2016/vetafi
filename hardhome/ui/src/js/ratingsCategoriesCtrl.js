'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsCategoriesCtrl', ['$scope', 'ratingsConfigsService',
    function($scope, ratingsConfigs) {
        console.log(ratingsConfigs);

        var currentCategory = ratingsConfigs;
        var breadcrumbs = [];

        function bindCategoryToScope(category) {
            $scope.breadcrumbs = _.map(breadcrumbs,
              function(c) { return c.description });
            $scope.subcategories = _.map(category.subcategories,
              function(c) { return c.description });
            $scope.category = category.description;
            $scope.diagnostic_code_sets = category.diagnostic_code_sets;
        }

        bindCategoryToScope(currentCategory);

        $scope.gotoSubcategory = function(subcategoryIndex) {
            var subcategory = currentCategory.subcategories[subcategoryIndex];
            breadcrumbs.push(currentCategory);
            currentCategory = subcategory;
            bindCategoryToScope(subcategory);
        };

        $scope.back = function() {
            if (breadcrumbs.length > 0) {
                currentCategory = breadcrumbs.pop();
                bindCategoryToScope(currentCategory);
            }
        }
    }]
);
