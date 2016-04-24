/**
 * Main AngularJS Web Application
 */
'use strict';
angular.module('formData', []);
var app = angular.module('vetaffiApp', [
    'ngRoute',
    'formData',
    'schemaForm',
    'ui.bootstrap',
    'analytics.mixpanel'
]);

angular.module('analytics.mixpanel')
    .config(['$mixpanelProvider', function($mixpanelProvider) {
        $mixpanelProvider.apiKey('<your project token>'); // your token is different than your API key
    }]);

app.controller('FormController', ['$scope', 'formData', 'formState', '$mixpanel',
    function ($scope, formData, formState, $mixpanel) {
    formState.addForm('VBA-21-526EZ-ARE');
    /**
     * These scope attributes are the main form data
     */
    // Describes all possible form elements.
    $scope.schema = {
        "type": "object",
        "title": "Form",
        "properties": {
        },
        "required": []
    };
    // Determines which form elements are rendered.
    // Button should always be rendered last as a special case.
    var button = {
        "type": "submit",
        "style": "btn-info",
        "title": "OK"
    };
    $scope.form = [button];
    // Holds responses to all form elements.
    $scope.model = {};



    $scope.vaForms = formState.getForms();
    $scope.downloadedForms = 0;
    downloadForms($scope.vaForms);

    function downloadForms(forms) {
        for (var i = 0; i<forms.length; i++) {
            formData.getFormData(forms[i], function(response) {
                combineFormResponse(response.data);
                $scope.downloadedForms += 1;
            }, function(response) {
                console.error(response);
            });
        }
    }

    function combineFormResponse(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                $scope.schema.properties[key] = data[key];
                if ($scope.schema.required.indexOf(key) === -1) {
                    $scope.schema.required.push(key);
                }

                /**
                 * Insert the new form element second to last (before the submit button)
                 */
                if ($scope.form.indexOf(key) === -1) {
                    $scope.form.splice($scope.form.length - 1, 0, key)
                }
            }
        }
    }

    $scope.getProgress = function (formName) {
        var total = 0;
        var filledOut = 0;
        for (var key in $scope.schema.properties) {
            if ($scope.schema.properties.hasOwnProperty(key)) {
                if ($scope.schema.properties[key].formName === formName) {
                    total += 1;
                }
                if ($scope.model[key]) {
                    filledOut += 1;
                }
            }
        }
        if (total == 0) {
            return "0";
        }

        return (filledOut / total) * 100;
    };

    $scope.getType = function (formName) {
        if ($scope.getProgress(formName) >= 100) {
            return "success";
        } else {
            return "info";
        }
    };
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
