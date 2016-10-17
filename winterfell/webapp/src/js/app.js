/**
 * Main AngularJS Web Application Declaration
 */
'use strict';

var app = angular.module('vetafiApp', [
  'angular-click-outside',
  'signature',
  'formly',
  'formlyBootstrap',
  'angular-momentjs',
  'ui.bootstrap',
  'ui.router'
]);

/**
 * Configure routes
 */
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state({
    name: 'root',
    url: '/app',
    abstract: true,
    templateUrl: 'templates/root.html',
    controller: 'headerCtrl',
    resolve: {
      user: ['Profile', function(Profile) {
        return Profile.resolveUser();
      }]
    }
  });

  $urlRouterProvider.otherwise('/app');

  // Home
  $stateProvider.state({
    name: 'root.home',
    url: '',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  });

  // FAQ
  $stateProvider.state({
    name: 'root.faq',
    url: '/faq',
    templateUrl: 'templates/faq.html',
    controller: 'faqCtrl'
  });

  // Settings
  $stateProvider.state({
    name: 'root.profile',
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'profileCtrl',
    abstract: true
  });

  $stateProvider.state({
    name: 'root.profile.general',
    url: '/general',
    templateUrl: 'templates/profile/general.html'
  });

  $stateProvider.state({
    name: 'root.profile.claims',
    url: '/claims',
    templateUrl: 'templates/profile/claims.html'
  });

  $stateProvider.state({
    name: 'root.profile.settings',
    url: '/settings',
    templateUrl: 'templates/profile/settings.html'
  });

  // TOS
  $stateProvider.state({
    name: 'root.tos',
    url: '/tos',
    templateUrl: 'templates/tos.html',
    controller: 'tosCtrl'
  });

  // Claims
  $stateProvider.state({
    name: 'root.claimstart',
    url: '/claim/start',
    templateUrl: 'templates/claimStart.html',
    controller: 'claimStartCtrl'
  });

  $stateProvider.state({
    name: 'root.claimselect',
    url: '/claim/{claimId}/select-forms',
    templateUrl: 'templates/claimSelectForms.html',
    controller: 'claimSelectFormsCtrl',
    resolve: {
      forms: ['net', '$q', '$stateParams', function(net, $q, $stateParams) {
        var deferred = $q.defer();

        net.getFormsForClaim($stateParams.claimId).then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure(res) {
            deferred.reject();
          }
        );

        return deferred.promise;
      }]
    }
  });

  $stateProvider.state({
    name: 'root.claimconfirm',
    url: '/claim/{claimId}/confirm',
    templateUrl: 'templates/claimConfirm.html',
    controller: 'claimConfirmCtrl'
  });

  $stateProvider.state({
    name: 'root.claimsubmit',
    url: '/claim/{claimId}/submit',
    templateUrl: 'templates/claimSubmitted.html',
    controller: 'claimSubmittedCtrl'
  });

  $stateProvider.state({
    name: 'root.claimview',
    url: '/claim/{claimId}',
    templateUrl: 'templates/claimView.html',
    controller: 'claimViewCtrl'
  });

  $stateProvider.state({
    name: 'root.form',
    url: '/claim/{claimId}/form/{formId}',
    templateUrl: 'templates/form.html',
    controller: 'formCtrl',
    resolve: {
      userValues: ['net', '$q', function(net, $q) {
        var deferred = $q.defer();

        net.getUserValues().then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure(res) {
            deferred.reject();
          }
        );

        return deferred.promise;
      }]
    }
  });
}]);
