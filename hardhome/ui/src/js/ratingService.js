'use strict';
var app = angular.module('vetafiApp');
app.factory('ratingService', [
    function () {
        var userRating = {
            ratingSelections: [],
            totalScore: 0
        };

        function updateScore() {
            var ratings = _.map(
              userRating.ratingSelections,
              function (x) {
                  return x.rating
              }
            ).sort().reverse();

            console.log("ratings xxxxxxxxxxxx", ratings);

            var newTotalRating = _.reduce(
              _.concat(0, ratings),
              function (left, right) {
                  return (((100 - left) / 100) * right) + left
              });
            userRating.totalScore = Math.round(newTotalRating);
        }

        return {
            addSelection: function (ratingSelection) {
                userRating.ratingSelections.push(ratingSelection);
                updateScore();
            },
            getUserRating: function() {
                return userRating;
            },
            removeSelection: function(selectionToRemove) {
                _.remove(userRating.ratingSelections,
                  function(selection) {
                    return _.isEqual(selection, selectionToRemove);
                  });
                updateScore();
            }
        }
    }]);
