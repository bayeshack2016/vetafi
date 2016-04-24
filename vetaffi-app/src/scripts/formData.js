(function () {
    'use strict';
    var module = angular.module('formData');
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

    module.factory('formState', [function() {
        var forms = {};
        function addForm(formName) {
            forms[formName] = false;
        }

        function removeForm(formName) {
            delete forms[formName];

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
        }

        return {
            addForm: addForm,
            removeForm: removeForm,
            getForms: getForms,
            completeForm: completeForm
        }

    }]);


}());