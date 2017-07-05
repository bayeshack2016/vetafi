'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsSelectCtrl', ['$scope', 'ratingsConfigsService', '$stateParams', '$state',
    function($scope, ratingsConfigs, $stateParams, $state) {
        function getPath(parameter) {
            return _.map(_.split(parameter, ","), function (index) { return parseInt(index) });
        }

        var categoryPath = $stateParams.categoryPath ? getPath($stateParams.categoryPath) : [];

        var ratingCategory = ratingsConfigs;
        var tempBreadcrumbs = [];
        tempBreadcrumbs.push(ratingCategory.description);
        _.map(categoryPath, function(i) {
            ratingCategory = ratingCategory.subcategories[i];
            tempBreadcrumbs.push(ratingCategory.description);
        });

        var rating = ratingCategory.ratings[parseInt($stateParams.ratingPath)];

        tempBreadcrumbs.push(rating.code.description);

        $scope.breadcrumbs = tempBreadcrumbs;


        console.log(rating);
        console.log(ratingCategory.ratings[parseInt($stateParams.ratingPath)].ratings);

        $scope.ratings = ratingCategory.ratings[parseInt($stateParams.ratingPath)].ratings;

        $scope.notes = ratingCategory.ratings[parseInt($stateParams.ratingPath)].notes;
        $scope.see_other_notes = ratingCategory.ratings[parseInt($stateParams.ratingPath)].see_other_notes;

        $scope.header = ratingCategory.ratings[parseInt($stateParams.ratingPath)].header;


        $scope.addRating = function(ratingRow, index) {
            console.log(index, ratingRow, rating);
        }
    }]
);
