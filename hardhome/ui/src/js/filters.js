'use strict';
var app = angular.module('vetafiApp');

app.filter('trusted', function($sce){
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    }
});
