var app = angular.module('vetaffiApp');

/*
    All questions here are from the PHQ-9 (Patient Health Questionnaire)
    These questions serve to measure & screen for severity of depression
*/
app.controller('questionCtrl', ['$scope', '$location', 'formState', '$mixpanel'
    function($scope, $location, formState, $mixpanel) {
        var symptomLimits = [5, 10, 15, 20];
        var symptomLevels = ['minimal', 'minor', 'major', 'severe'];
        var surveyBeginTime = new Date();

        $scope.getUniqueLabel = function(question, answer) {
            return "id_" + question.answerName + "_" + answer.val;
        };

        $scope.scoreSoFar = 0;

        $scope.selectOption = function(question, answer) {
            question.selectedVal = answer.val;
            $scope.scoreSoFar = calcScore();
            console.log('score so far: ' + $scope.scoreSoFar);

            $mixpanel.track("Questionnaire element fill", {
                key: question.answerName,
                timeSpent: (new Date() - surveyBeginTime)
            });
        };

        $scope.onSubmit = function() {
            // calculate score
            $scope.scoreSoFar = calcScore();
            var level = undefined;
            var i = 0;
            for (i = 0; i < symptomLimits.length; i++) {
                level = symptomLevels[i];
                if (symptomLimits[i] >= $scope.scoreSoFar) {
                    break;
                }
            }

            debugger;
            // Major/Severe Depression
            if (i >= 2) {
                // formState.suggestForm('ptsd');
            }
            $location.path('/file-claim');
            $scope.$apply();
        };

        function calcScore() {
            var sum = 0;
            $scope.questions.forEach(function (question) {
                if (question.selectedVal >= 0) {
                    sum += question.selectedVal;
                }
            });
            return sum;
        }

        $scope.questionsFilled = function() {
            var num = 0;
            $scope.questions.forEach(function (question) {
                if (question.selectedVal >= 0) {
                    num++;
                }
            });
            return num;
        }

        //
        // Questions
        //

        var optionRating = [
            {text: 'Very Poor', val: 0},
            {text: 'Poor', val: 0},
            {text: 'Okay', val: 0},
            {text: 'Very Good', val: 0}
        ];

        var optionFrequency = [
            {text: 'Not at all', val: 0},
            {text: 'Several Days', val: 1},
            {text: 'More Than Half the Days', val: 2},
            {text: 'Nearly Every Day', val: 3}
        ];

        $scope.questions = [
            {
                text: 'Little interest or pleasure in doing things',
                answerName: 'doing-things',
                answers: optionFrequency,
            },
            {
                text: 'Feeling down, depressed, or hopeless',
                answerName: 'feeling-down',
                answers: optionFrequency,
            },
            {
                text: 'Trouble falling asleep or staying asleep, or sleepin too much',
                answerName: 'sleep',
                answers: optionFrequency,
            },
            {
                text: 'Feeling tired or having little energy',
                answerName: 'little-energy',
                answers: optionFrequency,
            },
            {
                text: 'Poor appetite or overeating',
                answerName: 'appetite',
                answers: optionFrequency,
            },
            {
                text: "Feeling bad about yourself, that you're a failure or have let you or your family down",
                answerName: 'feeling-bad',
                answers: optionFrequency,
            },
            {
                text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
                answerName: 'concentration',
                answers: optionFrequency,
            },
            {
                text: 'Moving or speaking so slowly that other people could have noticed. Or, the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
                answerName: 'moving-pace',
                answers: optionFrequency,
            },
            {
                text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
                answerName: 'suicidal',
                answers: optionFrequency,
            },
            {
                text: 'How would you describe your social life?',
                answerName: 'social',
                answers: optionRating,
            },
        ];

        $scope.getProgress = function() {
            var percent = ($scope.questionsFilled() / $scope.questions.length) * 100;
            if (percent >= 100) {
                setTimeout(function() {
                    $('.progress-wrapper').fadeOut();
                }, 800);
            }
            return percent;
        };

        $scope.getType = function() {
            if ($scope.questionsFilled() < $scope.questions.length) {
                return 'info';
            } else {
                return 'success';
            }
        };
    }
]);
