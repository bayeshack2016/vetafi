'use script';
var app = angular.module('vetafiApp');
app.directive('ratingCategoryBreadcrumbs', function () {
    return {
        restrict: 'E',
        scope: {
            breadcrumbs: '=breadcrumbs'
        },
        templateUrl: '../templates/breadcrumbs.html',
        link: function (scope, element, attrs) {

            scope.links = _.map(scope.breadcrumbs, function (title) {
                return {title: title};
            });


            for (var i = 0; i < scope.links.length - 1; i++) {
                scope.links[i].lighten = true;
            }
            scope.links[(scope.links.length - 1)].current = true;
        }
    };
});
