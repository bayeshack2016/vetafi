var app = angular.module('vetaffiApp');

app.controller('headerCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.menuOptions = [
        {
            title: 'Home',
        },
        {
            title: 'Profile',
        },
        {
            title: 'Resources',
        }
    ];
}]);
