var bulk = require('bulk-require');
var forms = bulk('../conf/forms/', ['*']);
var claimsConfig = require('../../conf/claims.json');

var app = angular.module('vetafiApp');

/**
 * Roll up all of the formly form templates into a single angular module.
 */
app.factory('formConfig', [function() {
  return forms;
}]);

/**
 * Roll up the claims.json config into an angular module.
 */
app.factory('claimConfig', [function() {
  return claimsConfig;
}]);
