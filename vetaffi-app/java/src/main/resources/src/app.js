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

app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }]);

angular.module('analytics.mixpanel')
    .config(['$mixpanelProvider', function ($mixpanelProvider) {
        $mixpanelProvider.apiKey('a1edeb203acf26ad1d5e9c8ca4f24a07'); // your token is different than your API key
    }]);

app.controller('FormController', ['$scope', 'formData', 'formState', '$mixpanel', '$http', '$routeParams', '$location',
    function ($scope, formData, formState, $mixpanel, $http, $routeParams, $location) {
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
            $scope.submitClaim = true;
            console.log("submit");
            // Check if all fields are filled, unless a 'done' url parameter is set (for debug-only)
            if (!$routeParams.done && !tv4.validate($scope.model, $scope.schema)) {
                alert("Woops, not done yet");
                $scope.submitClaim = false;
                return;
            }
            $mixpanel.track("Form submit",
                {
                    formNames: $scope.vaForms,
                    timeSpent: (new Date() - formStartTime)
                });
            $('.submit-progress-bar').animate({width: '65%'}, 1000, function() {
                $('.submit-progress-bar').animate({width: '100%'}, 500, function() {
                    $('.submit-loading-modal img').addClass('show');
                    setTimeout(function() {
                        $location.path('/claim-submitted');
                        $scope.$apply();
                    }, 500);
                });
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

        $scope.getPdfUrl = function(formName) {
            var data = [];
            for (var key in $scope.model) {
                if ($scope.model.hasOwnProperty(key)) {
                    data.push({"fieldName": key, "fieldValue": JSON.stringify($scope.model[key])})
                }
            }

            var url = 'http://0.0.0.0:8080/api/create/' + formName;

            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data,
                responseType: 'arraybuffer'
            };
            $http(req)
                .success(function (response) {
                    console.log(response);
                    var blob = new Blob([response], { type : 'application/pdf' });
                    var url = (window.URL || window.webkitURL).createObjectURL( blob );
                    window.open(url);
                });
        }
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
