/**
 * Created by jeffreyquinn on 8/3/16.
 */
var app = angular.module('vetafiApp');
app.factory('formRenderingService', ['$window', '$http', function ($window, $http) {
    return {
        render: function (formName, data) {
            var req = {
                method: 'POST',
                url: '/render/' + formName,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data,
                withCredentials: true
            };

            $http(req)
                .then(function (response) {
                    console.log(response);
                    $window.open(response.data);
                },
                function (response) {
                    console.error(response);
                }
            );
        }
    }
}]);

/**
 * Service to retrieve the formly template (which is just a static JSON file)
 * for a given form.
 */
app.factory('formTemplateService', ['$http', function ($http) {
    return function (formName, cb) {
        var req = {
            method: 'GET',
            url: '/static/formly-forms/' + formName + '.json',
            headers: {
                Accept: 'application/json'
            }
        };

        $http(req)
            .then(function (response) {
                cb(response.data, null);

            },
            function (response) {
                console.error(response);
                cb(null, response);
            });
    }
}]);
