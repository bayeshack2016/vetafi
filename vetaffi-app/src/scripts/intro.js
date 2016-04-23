angular.module('ngRepeat', ['ngAnimate']).controller('linkCtrl', function($scope) {
  $scope.links = [
    {title:'Health Care FAQ', url:'/faq'},
    {title:'File a Health Claim', url:'/signin'},
    {title:'View your Health Status', url:'/signin'},
  ];
});