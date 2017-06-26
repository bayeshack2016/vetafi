'use strict';
var app = angular.module('vetafiApp');
app.controller('ratingsCtrl', ['$scope', 'ratingsConfigsService', '$stateParams', '$state',
    function($scope, ratingsConfigs, $stateParams, $state) {
        var path = _.map(_.split($stateParams.categoryPath, ","), function (index) { return parseInt(index) });
        path.shift();

        var temp = ratingsConfigs;
        var tempBreadcrumbs = [];
        tempBreadcrumbs.push(temp.description);
        _.map(path, function(i) {
            temp = temp.subcategories[i];
            tempBreadcrumbs.push(temp.description);
        });



        var ratings = temp.ratings[parseInt($stateParams.ratingPath)];

        console.log(ratings);
    }]
);
