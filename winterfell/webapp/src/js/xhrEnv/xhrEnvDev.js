'use strict';
var app = angular.module('vetafiApp');
app.factory('xhrEnv', function() {
  return {
    isDev: true,
    baseServerUrl: 'http://localhost:3999'
  };
});
