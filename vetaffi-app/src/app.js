/**
 * Main AngularJS Web Application
 */
'use strict';
angular.module('formData', []);
var app = angular.module('vetaffiApp', [
    'ngRoute',
    'formData',
    'schemaForm',
    'ui.bootstrap'
]);

app.controller('FormController', ['$scope', 'formData', function ($scope, formData) {
    $scope.schema = {
        "type": "object",
        "title": "Comment",
        "properties": {
            "name": {
                formName: "formB",
                "title": "Name",
                "type": "string"
            },
            "email": {
                formName: "formA",
                "title": "Email",
                "type": "string",
                "pattern": "^\\S+@\\S+$",
                "description": "Email will be used for evil."
            },
            "comment": {
                formName: "formA",
                "title": "Comment",
                "type": "string",
                "maxLength": 20,
                "validationMessage": "Don't be greedy!",
                "x-schema-form": {
                    "type": "textarea",
                    "placeholder": "in da schema",
                    "condition": "model.choice == 'one'"
                }

            },
            choice: {
                formName: "formA",
                type: "string",
                enum: ["one", "two"],
                "x-schema-form": {
                    key: "choice",
                    type: "radiobuttons",
                    titleMap: [
                        {value: "one", name: "One"},
                        {value: "two", name: "More..."}
                    ]
                }
            }
        },
        "required": [
            "name",
            "email",
            "comment",
            "something"
        ]
    };

    $scope.form = [
        "name",
        "email",
        "comment",
        "choice",

        {
            "type": "submit",
            "style": "btn-info",
            "title": "OK"
        }
    ];

    $scope.vaForms = ['formA', 'formB'];

    $scope.getProgress = function (formName) {
        var total = 0;
        var filledOut = 0;
        for (var key in $scope.schema.properties) {
            if ($scope.schema.properties.hasOwnProperty(key)) {
                console.log($scope.schema.properties[key]);
                if ($scope.schema.properties[key].formName === formName) {
                    total += 1;
                }
                if ($scope.model[key]) {
                    filledOut += 1;
                }
            }
        }
        console.log(total);
        console.log(filledOut);
        console.log(formName);
        if (total == 0) {
            return "0";
        }

        return (filledOut / total) * 100;
    };

    $scope.getType = function (formName) {
        console.log($scope.getProgress(formName));
        if ($scope.getProgress(formName) >= 100) {
            return "success";

        } else {
            return "info";
        }
    };

    $scope.model = {};
}]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "templates/intro.tpl.html"
    });
    $routeProvider.when("/signin", {
        templateUrl: "templates/signin.tpl.html"
    });
    $routeProvider.when("/form", {
        templateUrl: "templates/form.tpl.html"
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}]);
