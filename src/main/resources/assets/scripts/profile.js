var app = angular.module('vetaffiApp');

app.controller('profileCtrl', ['$scope', '$mixpanel', '$routeParams',
    function($scope, $mixpanel, $routeParams) {

    $routeParams = {
        claimsInProgress: 'ptsd',
        pastClaims: 'ptsd'
    };

    $scope.claimsInProgress = $routeParams.claimsInProgress;
    $scope.pastClaims = $routeParams.pastClaims;
    $scope.anyActions = $scope.claimsInProgress || $scope.pastClaims;
    $scope.claimState = 'verified';

    $scope.claimTextMapper = {
        'received' : 'The VA has received your file.<br>Now verifying your information...',
        'verified' : 'The VA has verified your information.<br>Now evaluating your claim...',
        'evaluated': 'The VA has evaluated your claim.<br>They are finishing up soon!',
        'finished': 'Congrats! Your health claim has been approved!'
    };

    $scope.formMapper = {
        'ptsd' : { title: 'PTSD', name: 'VBA-21-526EZ-ARE' },
        'physical' : { title: 'Physical Injuries', name: 'VBA-21-526EZ-ARE' },
        'general' : { title: 'General', name: 'VBA-21-526EZ-ARE' }
    };

    $scope.user = {
        email: 'kittykatvet@gmail.com',
        address: '135 Bluxome St',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94107',
        country: 'United States'
    }

    $scope.stats = [
        {
            title: 'Name',
            fieldName: 'name',
            value: 'Katherine Ann Williams'
        },
        {
            title: 'Rank',
            value: 'Captain'
        },
        {
            title: 'Service',
            values: ['Marine Corps 1942-1946', 'Navy 1952-1953']
        },
        {
            title: 'Discharge date',
            value: 'Dec. 17, 2014'
        },
    ];

    $mixpanel.track("profile_page_landed", {});
}]);

