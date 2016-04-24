var app = angular.module('vetaffiApp');

app.controller('claimSubmittedCtrl', ['$scope', '$mixpanel',
    function($scope, $mixpanel) {
        $scope.user = {
            firstName : 'Katherine',
            email: 'kittykatvet@gmail.com'
        };
        $mixpanel.track("claim_submitted_page_landed", {});
    }
]);

