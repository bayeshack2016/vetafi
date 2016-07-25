var app = angular.module('vetaffiApp');

app.controller('introCtrl', ['$scope', '$mixpanel', function($scope, $mixpanel) {
  $scope.links = [
    {
        title:'File a Benefits Claim',
        url:'#signin?action=file'
    },
    {
        title:'View your Claim Status',
        url:'#signin?action=profile'
    },
    {
        title:'Benefits Resources',
        url:'#faq'
    }
  ];

  $mixpanel.track("intro_page_landed", {});
}]);

