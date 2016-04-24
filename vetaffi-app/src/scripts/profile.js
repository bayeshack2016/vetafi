var app = angular.module('vetaffiApp');

app.controller('profileCtrl', ['$scope', '$mixpanel', function($scope, $mixpanel) {
    $mixpanel.track("profile_page_landed", {});
}]);

