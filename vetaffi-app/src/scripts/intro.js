
var app = angular.module('vetaffiApp');
app.controller('introCtrl', function($scope) {
  $scope.links = [
    {
        title:'Health Care FAQ',
        url:'#faq'
    },
    {
        title:'File a Health Claim',
        url:'#signin?action=file'
    },
    {
        title:'View your Health Status',
        url:'#signin?action=status'
    },
  ];
});