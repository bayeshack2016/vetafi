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

    $scope.onClickMenu = function() {
        var target = $('.header-menu');
        if (target.hasClass('show')) {
            target.removeClass('show');
        } else {
            target.addClass('show');
        }
    };
}]);
