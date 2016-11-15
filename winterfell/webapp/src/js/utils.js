'use strict';
var app = angular.module('vetafiApp');
app.factory('utils', function() {
  return {
    // given a mongoDb date string, return a readable date
    formatServerDate: function(serverDate, dateStr) {
      var dateObj = new Date(serverDate);
      if (dateStr) {
        return dateObj.toDateString();
      } else {
        var date = dateObj.getDate();
        var month = dateObj.getMonth() + 1; // [0-11] starting from January
        var year = dateObj.getFullYear();
        return month + "/" + date + "/" + year;
      }
    }
  };
});
