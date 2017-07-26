'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsSelectCtrl', ['$scope',
    'ratingsConfigsService',
    '$stateParams',
    '$state',
    'ratingService',
    function($scope, ratingsConfigs, $stateParams, $state, ratingService) {
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


        $scope.addRating = function(ratingRow) {
            var ratingsScore = ratingRow.rating;
            var diagnosis = rating.code;

            ratingService.addSelection({rating: ratingsScore, diagnosis: diagnosis});
            console.log(ratingService.getUserRating());
            $state.go('root.ratingsHome');

        }
    }]
);
