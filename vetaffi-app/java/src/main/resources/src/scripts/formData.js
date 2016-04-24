(function () {
    'use strict';
    var module = angular.module('formData', ['analytics.mixpanel']);
    var validForms = ['VBA-21-526EZ-ARE', 'VBA-21-0781-ARE', 'VBA-21-4502-ARE'];
    var formDescriptions = {
        'VBA-21-526EZ-ARE': "Essential basic form. Must be filled out for almost all claims.",
        'VBA-21-0781-ARE': "For claims relating to PTSD.",
        'VBA-21-4502-ARE': "For claims related to automobiles or other conveyances."
    };

    module.factory('formData', ['$http', '$sce', function ($http, $sce) {

        function getFormData(formName, successCb, errorCb) {
            $http({
                method: 'GET',
                url: 'static/' + formName + '.json'
            }).then(successCb, errorCb);
        }

        function getRenderedForm(formName, data) {
            console.log(JSON.stringify(data));
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
                    var file = new Blob([response], {type: 'application/pdf'});
                    var fileURL = URL.createObjectURL(file);
                });

        }

        return {
            getFormData: getFormData,
            getRenderedForm: getRenderedForm
        };
    }
    ]);

    module.factory('formState', ['$mixpanel', function ($mixpanel) {
        var forms = {};
        var suggestions = {};

        function addForm(formName) {
            forms[formName] = false;
        }

        function removeForm(formName) {
            delete forms[formName];
        }

        function getDescriptions() {
            return formDescriptions;
        }

        function suggestForm(formName) {
            suggestions[formName] = true;
        }

        function getSuggestions() {
            return suggestions;
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
            suggestForm: suggestForm,
            getSuggestions: getSuggestions,
            getDescriptions: getDescriptions
        }
    }]);


}());