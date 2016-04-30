var app = angular.module('vetaffiApp');

app.controller('physicalInjuryCtrl', ['$scope', '$location', '$mixpanel',
    function($scope, $location, $mixpanel) {

        $scope.firstSelect = false;
        $scope.secondSelect = false;
        $scope.injury = false;          // user has an injury
        $scope.military = false;        // during military

        $scope.selectInjury = function(answer) {
            $scope.injury = answer;
            $scope.firstSelect = true;
            $mixpanel.track("physical_injury", {
                physicalInjury: answer
            });
        };

        $scope.selectMilitary = function(answer) {
            $scope.military = answer;
            $scope.secondSelect = true;
            $mixpanel.track("military_injury", {
                militaryInjury: answer
            });
        };

        $scope.goFile = function() {
            $location.path('/file-claim');
        };

        $scope.goToQuestions = function() {
            $location.path('/questionnaire');
        };
    }
]);
