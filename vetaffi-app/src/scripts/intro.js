var app = angular.module('vetaffiApp');

app.controller('introCtrl', ['$scope', '$mixpanel', function($scope, $mixpanel) {
  $scope.links = [
    {
        title:'View Health Resources',
        url:'#faq'
    },
    {
        title:'File a Health Claim',
        url:'#signin?action=file'
    },
    {
        title:'View your Health Status',
        url:'#signin?action=profile'
    }
  ];

  $mixpanel.track("intro_page_landed", {});
});

