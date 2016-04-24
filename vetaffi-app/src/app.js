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
    .config(['$mixpanelProvider', function ($mixpanelProvider) {
        $mixpanelProvider.apiKey('a1edeb203acf26ad1d5e9c8ca4f24a07'); // your token is different than your API key
    }]);

app.controller('FormController', ['$scope', 'formData', 'formState', '$mixpanel',
    function ($scope, formData, formState, $mixpanel) {
        $mixpanel.track("Form start",
            {
                formNames: $scope.vaForms
            });
        /**
         * These scope attributes are the main form data
         */
            // Describes all possible form elements.
        $scope.schema = {
            "type": "object",
            "title": "Form",
            "properties": {},
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

        var formStartTime = new Date();
        $scope.onSubmit = function (form) {
            console.log("submit");
            if (!tv4.validate($scope.model, $scope.schema)) {
                alert("Not done yet");
                return;
            }
            $mixpanel.track("Form submit",
                {
                    formNames: $scope.vaForms,
                    timeSpent: (new Date() - formStartTime)
                });
        };

        function downloadForms(forms) {
            for (var i = 0; i < forms.length; i++) {
                formData.getFormData(forms[i], function (response) {
                    combineFormResponse(response.data);
                    $scope.downloadedForms += 1;
                }, function (response) {
                    console.error(response);
                });
            }
        }

        var currentKey;
        var elementStartTime;
        $scope.onChange = function (key, value) {
            console.log(key, value);
            if (key != currentKey) {
                if (currentKey) {
                    $mixpanel.track("Form element fill",
                        {
                            key: key,
                            formNames: $scope.vaForms,
                            timeSpent: (new Date() - elementStartTime)
                        });
                }
            }
            currentKey = key;
            elementStartTime = new Date();
        };

        function combineFormResponse(data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    $scope.schema.properties[key] = data[key];
                    if ($scope.schema.properties[key]["x-schema-form"]) {
                        $scope.schema.properties[key]["x-schema-form"]['onChange'] = "onChange(form.key,modelValue)";
                    } else {
                        $scope.schema.properties[key]["x-schema-form"] = {onChange: "onChange(form.key,modelValue)"};
                    }

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
            return ($scope.getProgressNumerator(formName) / $scope.getProgressDenominator(formName)) * 100;
        };

        $scope.getProgressNumerator = function (formName) {
            var filledOut = 0;
            for (var key in $scope.schema.properties) {
                if ($scope.schema.properties.hasOwnProperty(key)) {
                    if ($scope.model[key]) {
                        if ($scope.model[key].length === 1 && jQuery.isEmptyObject($scope.model[key][0])) {
                            continue;
                        }
                        filledOut += 1;
                        console.log(key);
                        console.log($scope.model[key]);
                    }
                }
            }

            return filledOut;
        };

        $scope.getProgressDenominator = function (formName) {
            var total = 0;

            for (var key in $scope.schema.properties) {
                if ($scope.schema.properties.hasOwnProperty(key)) {
                    if ($scope.schema.properties[key].formName === formName) {
                        if($scope.schema.properties[key]["x-schema-form"].condition) {
                            if (!$scope.$eval($scope.schema.properties[key]["x-schema-form"].condition)) {
                                continue;
                            }
                        }
                        total += 1;
                    }
                }
            }

            return total;
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
    $routeProvider.when("/faq", {
            templateUrl: "templates/faq.tpl.html"
        });
    $routeProvider.when("/signin", {
        templateUrl: "templates/signin.tpl.html"
    });
    $routeProvider.when("/physical-injury", {
        templateUrl: "templates/physicalInjury.tpl.html"
    });
    $routeProvider.when("/profile", {
            templateUrl: "templates/profile.tpl.html"
        });
    $routeProvider.when("/file-claim", {
        templateUrl: "templates/fileClaim.tpl.html"
    });
    $routeProvider.when("/questionnaire", {
        templateUrl: "templates/questionnaire.tpl.html"
    });
    $routeProvider.when("/form", {
        templateUrl: "templates/form.tpl.html"
    });
    $routeProvider.when("/claim-submitted", {
        templateUrl: "templates/claimSubmitted.tpl.html"
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}]);
