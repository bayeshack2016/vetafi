(function () {
    'use strict';
    var module = angular.module('formData', ['analytics.mixpanel']);
    var validForms = ['VBA-21-526EZ-ARE'];

    module.factory('formData', ['$http', function ($http) {

        function getFormData(formName, successCb, errorCb) {
            $http({
                method: 'GET',
                url: 'static/' + formName + '.json'
            }).then(successCb, errorCb);
        }

        return {
            getFormData: getFormData
        };
    }
    ]);

    module.factory('formState', ['$mixpanel', function($mixpanel) {
        var forms = {};
        var suggestions = {};
        function addForm(formName) {
            forms[formName] = false;
        }

        function removeForm(formName) {
            delete forms[formName];

        }

        function suggestForm(formName) {
            suggestions[formName] = true;
        }

        function getForms() {
            var output = [];
            for (var key in forms) {
                if (forms.hasOwnProperty(key)) {
                    output.push(key);
                }
            }
            return output;
        }

        function completeForm(formName) {
            forms[formName] = true;
            $mixpanel.track("Form completed", {"formName": formName})
        }

        function getValidForms() {
            return validForms.slice(0); // copy array
        }

        return {
            addForm: addForm,
            removeForm: removeForm,
            getForms: getForms,
            completeForm: completeForm,
            getValidForms: getValidForms,
            suggestForm: suggestForm
        }

    }]);


}());