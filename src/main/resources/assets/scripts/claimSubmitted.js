var app = angular.module('vetaffiApp');

app.controller('claimSubmittedCtrl', ['$scope', '$mixpanel', '$location',
    function($scope, $mixpanel, $location) {
        $scope.user = {
            firstName : 'Katherine',
            email: 'kittykatvet@gmail.com'
        };
        $mixpanel.track("claim_submitted_page_landed", {});

        $scope.goToProfile = function() {
            $location.path('/profile');
        };

        $scope.goHome = function() {
            $location.path('/home');
        };
    }
]);

