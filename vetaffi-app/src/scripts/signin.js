var app = angular.module('vetaffiApp');

app.controller('signinCtrl',
    ['$scope', '$routeParams', '$location',
    function ($scope, $routeParams, $location) {
        $scope.inputForms = [
            {
                title:'First Name',
                name: 'fname',
                placeholder:'Enter your first name'
            },
            {
                title:'Last Name',
                name: 'lname',
                placeholder:'Enter your last name'
            },
            {
                title:'Email Address',
                name: 'email',
                placeholder:'Enter your email address'
            },
        ];

        $scope.onSubmit = function() {
            var progressBar = $('.submit-btn .progress');
            progressBar.animate(
                { width: '35%' },
                { duration: 300 }
            );

            // after network query
            setTimeout(function() {
                // on success
                progressBar.animate(
                    { width: '100%' },
                    200, redirectToAction);

                // On fail!
                // progressBar.addClass('fail');
                //        progressBar.animate(
                //                { width: '0%' },
                //                { duration: 600 }
                //              );
            }, 600);
        };

        function redirectToAction() {
            var action = $routeParams.action;
            console.log('action ' + action);
            if (action == 'file') {
                $location.url('/physical-injury')
                $scope.$apply();
            } else if (action == 'profile') {
                $location.url('/profile');
                $scope.$apply();
            } else {
                console.log('unknown action');
            }
        }

    }
]);

