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

app.controller('FormController', ['$scope', 'formData', 'formState', '$mixpanel', '$http', '$routeParams', '$location', '$timeout',
    function ($scope, formData, formState, $mixpanel, $http, $routeParams, $location, $timeout) {
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
        $scope.form = [];
        // Holds responses to all form elements.
        $scope.model = {};


        $scope.vaForms = formState.getForms();
        $scope.downloadedForms = 0;
        downloadForms($scope.vaForms);

        var formStartTime = new Date();
        $scope.onSubmit = function (form) {
            $scope.submitClaim = true;
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
            $('.submit-progress-bar').animate({width: '60%'}, 1200, function () {
                $('.submit-progress-bar').animate({width: '100%'}, 500, function () {
                    $('.submit-loading-modal img').addClass('show');
                    setTimeout(function () {
                        $location.path('/claim-submitted');
                        $scope.$apply();
                    }, 500);
                });
            });
        };

        function downloadForms(forms) {
            var q = $({});
            for (var i = 0; i < forms.length; i++) {
                q = q.queue(
                    function (formName) {
                        return function (next) {
                            formData.getFormData(formName,
                                function (formName, response) {
                                    combineFormResponse(response.data);
                                    $scope.downloadedForms += 1;
                                    next();
                                }, function (formName, response) {
                                    console.error(response);
                                })
                        }
                    }(forms[i])
                );
            }
            q.queue(function (next) {
                $scope.$broadcast('schemaFormRedraw');
                next();
            });
        }

        var currentKey;
        var elementStartTime;
        $scope.onChange = function (key, value) {
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

        var added = {};
        var removed = 0;
        var added_true = 0;

        function combineFormResponse(data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    $scope.schema.properties[key] = data[key];

                    if ($scope.schema.properties[key]["x-schema-form"]) {
                        $scope.schema.properties[key]["x-schema-form"]['onChange'] = "onChange(form.key,modelValue)";
                    } else {
                        $scope.schema.properties[key]["x-schema-form"] = {onChange: "onChange(form.key,modelValue)"};
                    }

                    /**
                     * Insert the new form element second to last (before the submit button)
                     */
                    var newk = {
                        key: key,
                        index: data[key].index,
                        style: {
                            selected: "btn-primary",
                            unselected: "btn-info"
                        }
                    };
                    if (!added.hasOwnProperty(key)) {
                        $scope.form.push(newk);
                        added[key] = newk;
                        added_true += 1;
                    } else {
                        removed += 1;
                    }
                }
            }
            $scope.form.sort(function (x, y) {
                if (x.formName < y.formName) return -1;
                if (x.formName > y.formName) return 1;
                if (x.index < y.index) return -1;
                if (x.index > y.index) return 1;
                return 0;
            });
        }

        $scope.getProgress = function (formName) {
            return ($scope.getProgressNumerator(formName) / $scope.getProgressDenominator(formName)) * 100;
        };

        $scope.getProgressNumerator = function (formName) {
            var filledOut = 0;
            for (var key in $scope.schema.properties) {
                if ($scope.schema.properties.hasOwnProperty(key) && $scope.schema.properties[key].formName === formName) {
                    if ($scope.model[key]) {
                        if ($scope.model[key].length === 1 && jQuery.isEmptyObject($scope.model[key][0])) {
                            continue;
                        }
                        filledOut += 1;
                    }
                }
            }

            return filledOut;
        };

        $scope.getProgressDenominator = function (formName) {
            var total = 0;

            for (var key in $scope.schema.properties) {
                if ($scope.schema.properties.hasOwnProperty(key) && $scope.schema.properties[key].formName === formName) {
                    if ($scope.schema.properties[key]["x-schema-form"].condition && !$scope.$eval($scope.schema.properties[key]["x-schema-form"].condition)) {
                        continue;
                    }
                    total += 1;
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

        function prepareData(formState, output, suffix) {
            if (output === undefined) {
                output = [];
            }

            if (suffix === undefined) {
                suffix = '';
            }
            console.log(arguments);
            for (var key in formState) {
                if (formState.hasOwnProperty(key)) {
                    if (Array.isArray(formState[key])) {
                        for (var i = 0; i < formState[key].length; i++) {
                            prepareData(formState[key][i], output, ('_' + i));
                        }
                    } else if (formState[key] !== null && typeof formState[key] === 'object') {
                        prepareData(formState[key], output);
                    } else {
                        if (formState[key]) {
                            output.push({
                                fieldName: key + suffix,
                                fieldValue: formState[key]
                            });
                        }
                    }
                }
            }
            return output;
        }

        $scope.getPdfUrl = function (formName) {
            var data = prepareData($scope.model);
            console.log(data);

            var url = 'api/create/' + formName;

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
                    var blob = new Blob([response], {type: 'application/pdf'});
                    var url = (window.URL || window.webkitURL).createObjectURL(blob);
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
    }).when("/faq", {
        templateUrl: "templates/faq.tpl.html"
    }).when("/signin", {
        templateUrl: "templates/signin.tpl.html"
    }).when("/physical-injury", {
        templateUrl: "templates/physicalInjury.tpl.html"
    }).when("/profile", {
        templateUrl: "templates/profile.tpl.html"
    }).when("/file-claim", {
        templateUrl: "templates/fileClaim.tpl.html"
    }).when("/questionnaire", {
        templateUrl: "templates/questionnaire.tpl.html"
    }).when("/form", {
        templateUrl: "templates/form.tpl.html"
    }).when("/claim-submitted", {
        templateUrl: "templates/claimSubmitted.tpl.html"
    }).otherwise({
        redirectTo: '/'
    });
}]);
