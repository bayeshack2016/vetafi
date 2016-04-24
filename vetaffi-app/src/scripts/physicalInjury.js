var app = angular.module('vetaffiApp');

app.controller('physicalInjuryCtrl', ['$scope', '$location',
    function($scope, $location) {

        $scope.firstSelect = false;
        $scope.secondSelect = false;
        $scope.injury = false;          // user has an injury
        $scope.military = false;        // during military

        $scope.selectInjury = function(answer) {
            $scope.injury = answer;
            $scope.firstSelect = true;
        };

        $scope.selectMilitary = function(answer) {
            $scope.military = answer;
            $scope.secondSelect = true;

            if ($scope.military) {
                // let's file a claim!
            } else {
                // call this number
            }
        };

        $scope.goFile = function() {
            $location.path('/file-claim')
        };

        $scope.goToQuestions = function() {
            $location.path('/questionnaire');
        };
    }
]);
