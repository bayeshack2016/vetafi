var bulk = require('bulk-require');
var sections = bulk('../forms/', ['*']);

var app = angular.module('vetafiApp');

/**
 * Roll up all of the formly form templates into a single angular module.
 */
app.factory('formTemplateService', [function() {
  return sections;
}]);
