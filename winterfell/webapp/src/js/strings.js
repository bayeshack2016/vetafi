'use strict';
var app = angular.module('vetafiApp');
app.factory('strings', function() {
  return {
    branches: {
      airforce: 'United States Department of the Air Force',
      army: 'United States Department of the Army',
      coastguard: 'United States Coast Guard',
      marine: 'United States Marine Corps',
      navy: 'United States Department of the Navy'
    },
    ranks: {
      captain: 'Captain',
      lieutenant: 'Lieutenant Commander',
      vice_admiral: 'Vice Admiral'
    }
  };
});
