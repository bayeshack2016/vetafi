var app = angular.module('vetaffiApp');

app.controller('questionCtrl', ['$scope', function($scope) {
    var fiveOptionRating = [
        {text: 'Very poor', val: -2},
        {text: 'Poor', val: -1},
        {text: 'Okay', val: 0},
        {text: 'Good', val: 1},
        {text: 'Awesome', val: 2}
    ];

    var frequencyDaysOptions = [
        {text: 'None', val: 1},
        {text: 'Once or twice', val: 1},
        {text: '3-4 times', val: -1},
        {text: '5-6 times', val: -2},
        {text: 'Everyday', val: -2},
    ];


    $scope.questions = [
        {
            text: 'How would you describe your social life?',
            type: 'radios',
            answerName: 'social',
            answers: fiveOptionRating
        },
        {
            text: 'How often do you drink alone per week?',
            type: 'radios',
            answerName: 'drink',
            answers: frequencyDaysOptions
        },
        {
            text: 'Describe a person you are close to (can be anyone!)',
            type: 'text',
            answerName: 'friend1',
            placeholder: 'How did you meet this person?'
        },
        {
            text: 'Describe another person you are close to!',
            type: 'text',
            answerName: 'friend2',
            placeholder: "What's your fondest memory with this person?"
        },
    ];
}]);
