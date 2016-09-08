'use strict';
var app = angular.module('vetafiApp');
app.factory('xhrEnv', function() {
  return {
    isDev: false,
    baseServerUrl: 'https://www.vetafi.org'
  };
});
