var bulk = require('bulk-require');
var ratingsConfigs = bulk('../conf/ratings/', ['*']);

var app = angular.module('vetafiApp');

/**
 * Roll up all of the ratings configs into a single JSON object.
 */
app.factory('ratingsConfigsService', [function() {
  return {
    description: 'All Categories',
    subcategories: _.values(ratingsConfigs)
  }
}]);