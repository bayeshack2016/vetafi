/**
 * Main AngularJS Web Application
 */
'use strict';
angular.module('formData', []);
var app = angular.module('vetaffiApp', [
    'ngRoute',
    'formData',
    'schemaForm'
]);

app.controller('FormController', ['$scope', 'formData', function ($scope, formData) {
    $scope.schema = {
        "type": "object",
        "title": "Comment",
        "properties": {
            "name": {
                "title": "Name",
                "type": "string"
            },
            "email": {
                "title": "Email",
                "type": "string",
                "pattern": "^\\S+@\\S+$",
                "description": "Email will be used for evil."
            },
            "comment": {
                "title": "Comment",
                "type": "string",
                "maxLength": 20,
                "validationMessage": "Don't be greedy!"
            }
        },
        "required": [
            "name",
            "email",
            "comment"
        ]
    };

    $scope.form = [
        "name",
        "email",
        {
            "key": "comment",
            "type": "textarea",
            "placeholder": "Make a comment"
        },
        {
            "type": "submit",
            "style": "btn-info",
            "title": "OK"
        }
    ];

    $scope.model = {};
    console.log("in controller");
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
