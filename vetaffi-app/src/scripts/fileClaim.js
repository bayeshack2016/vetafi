var app = angular.module('vetaffiApp');

app.controller('fileClaimCtrl', ['$scope', 'formState', '$location',
    function($scope, formState, $location) {
        formState.suggestForm("VBA-21-4502-ARE");
        $scope.formNames = formState.getValidForms();
        $scope.formSelections = {};

        $scope.onSubmit = function() {
            for (var key in $scope.formSelections) {
                if ($scope.formSelections.hasOwnProperty(key) && $scope.formSelections[key]) {
                    formState.addForm(key);
                }
            }
            $location.path('/form');
        };

        $scope.suggestions = formState.getSuggestions();
        $scope.descriptions = formState.getDescriptions();

        // Loading Animation
        $(function() {
            var spinner = $('.spinner');
            spinner.addClass('spin');
            setTimeout(function() {
                spinner.addClass('spin-faster');
                setTimeout(function() {
                    $('.loading-view').addClass('disappear');
                    $('.original-view').addClass('appear');
                }, 1000);
            }, 1200);
        });
    }
]);
