'use strict';
var app = angular.module('vetafiApp');
app.factory('xhrEnv', function() {
  return {
    isDev: true,
    baseServerUrl: 'http://localhost:3999',

    idMeClientId: '684c7204feed7758b25527eae2d66e28'
  };
});
