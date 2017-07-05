'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsCategoriesCtrl', ['$scope', 'ratingsConfigsService', '$stateParams', '$state',
    function($scope, ratingsConfigs, $stateParams, $state) {
        function getCategoryPath() {
            return _.map(_.split($stateParams.path, ","), function (index) { return parseInt(index) });
        }

        var path = $stateParams.path ? getCategoryPath() : [];

        var currentCategory = ratingsConfigs;
        var tempBreadcrumbs = [];
        tempBreadcrumbs.push(currentCategory.description);
        _.map(path, function(i) {
            currentCategory = currentCategory.subcategories[i];
            tempBreadcrumbs.push(currentCategory.description);
        });

        $scope.breadcrumbs = tempBreadcrumbs;
        $scope.notes = currentCategory.notes;

        console.log(currentCategory);

        function bindCategoryToScope(category) {
            $scope.subcategories = _.map(category.subcategories,
              function(c) { return c.description });
            $scope.category = category.description;
            $scope.ratings = category.ratings;
        }

        bindCategoryToScope(currentCategory);

        $scope.gotoSubcategory = function(subcategoryIndex) {
            $state.go('root.ratingsCategories', {path: _.join(
              _.concat(path, subcategoryIndex), ",")});
        };

        $scope.gotoRating = function(ratingIndex) {
            $state.go('root.ratingsSelect', {
                categoryPath: _.join(path, ","),
                ratingPath: ratingIndex
            });
        };
    }]
);
