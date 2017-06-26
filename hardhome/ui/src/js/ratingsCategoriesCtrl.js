'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsCategoriesCtrl', ['$scope', 'ratingsConfigsService', '$stateParams', '$state',
    function($scope, ratingsConfigs, $stateParams, $state) {
        var path = _.map(_.split($stateParams.path, ","), function (index) { return parseInt(index) });
        path.shift();

        var temp = ratingsConfigs;
        var tempBreadcrumbs = [];
        tempBreadcrumbs.push(temp.description);
        _.map(path, function(i) {
            temp = temp.subcategories[i];
            tempBreadcrumbs.push(temp.description);
        });

        console.log(ratingsConfigs);

        var currentCategory = temp;
        var breadcrumbs = tempBreadcrumbs;

        function bindCategoryToScope(category) {
            $scope.breadcrumbs = _.map(breadcrumbs,
              function(c) { return c.description });
            $scope.subcategories = _.map(category.subcategories,
              function(c) { return c.description });
            $scope.category = category.description;
            $scope.ratings = category.ratings;
        }

        bindCategoryToScope(currentCategory);

        $scope.gotoSubcategory = function(subcategoryIndex) {
            $state.go('root.ratingsCategories', {path: _.join(
              _.concat(0, path, subcategoryIndex), ",")});
        };

        $scope.gotoRating = function(ratingIndex) {
            $state.go('root.ratings', {
                categoryPath: _.join(_.concat(0, path), ","),
                ratingPath: ratingIndex
            });
        };
    }]
);
