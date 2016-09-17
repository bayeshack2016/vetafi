var app = angular.module('vetafiApp');
app.directive('vfiBreadcrumbs', function () {
  return {
    restrict: 'E',
    templateUrl: '../templates/breadcrumbs.html',
    link: function(scope, element, attrs) {
      scope.links = [
        {
          title: 'Start'
        },
        {
          title: 'Fill Forms'
        },
        {
          title: 'Review'
        },
        {
          title: 'Submit'
        }
      ];

      function init() {
        if (attrs.page) {
          var pageNum = Number(attrs.page);
          pageNum = Math.min(pageNum, scope.links.length - 1);
          pageNum = Math.max(pageNum, 0);

          for (var i = 0; i <= pageNum; i++) {
            scope.links[i].lighten = true;
          }
          scope.links[pageNum].current = true;
        }
      }

      init();
    }
  };
});
