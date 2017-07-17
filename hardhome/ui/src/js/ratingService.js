'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', [
    function () {
        var userRating = {
            ratingSelections: [],
            totalScore: 0
        };

        return {
            addSelection: function (ratingSelection) {
                userRating.ratingSelections.push(ratingSelection);

                var ratings = _.map(
                  userRating.ratingSelections,
                  function (x) {
                      return x.rating
                  }
                ).sort().reverse();

                _.reduce()
            }
        }
    }]);
