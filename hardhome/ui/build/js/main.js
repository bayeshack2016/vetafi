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
      user: ['Profile', function (Profile) {
        return Profile.resolveUser();
      }],
      userClaims: ['net', '$q', 'claimService', function(net, $q, claimService) {
        var deferred = $q.defer();
        net.getClaimsForUser().then(
          function success(res) {
            var existingClaim = _.find(res.data.claims, {'state': 'incomplete'});
            if (!_.isEmpty(existingClaim)) {
              claimService.setClaim(existingClaim);
            }
            deferred.resolve(res.data);
          }, function failure(res) {
            deferred.resolve(null);
          }
        );
        return deferred.promise;
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

  // Settings
  $stateProvider.state({
    name: 'root.profile',
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'profileCtrl',
    abstract: true,
    resolve: {
      userClaims: ['net', '$q', function(net, $q) {
        var deferred = $q.defer();
        net.getClaimsForUser().then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
            deferred.reject();
          }
        );
        return deferred.promise;
      }]
    }
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
      claimForms: ['net', '$q', '$stateParams', function(net, $q, $stateParams) {
        var deferred = $q.defer();

        net.getFormsForClaim($stateParams.claimId).then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
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
    controller: 'claimConfirmCtrl',
    resolve: {
      user: ['Profile', function (Profile) {
        return Profile.resolveUser();
      }],
      userValues: ['net', '$q', function(net, $q) {
        var deferred = $q.defer();

        net.getUserValues().then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
            deferred.reject();
          }
        );

        return deferred.promise;
      }],
      forms: ['net', '$q', '$stateParams', function (net, $q, $stateParams) {
        var deferred = $q.defer();

        net.getFormsForClaim($stateParams.claimId).then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
            deferred.reject();
          }
        );

        return deferred.promise;
      }]
    }
  });

  $stateProvider.state({
    name: 'root.claimsubmit',
    url: '/claim/{claimId}/submit?error',
    templateUrl: 'templates/claimSubmitted.html',
    controller: 'claimSubmittedCtrl'
  });

  $stateProvider.state({
    name: 'root.claimview',
    url: '/claim/{claimId}',
    templateUrl: 'templates/claimView.html',
    controller: 'claimViewCtrl',
    resolve: {
      claim: ['net', '$q', '$stateParams', function(net, $q, $stateParams) {
        var deferred = $q.defer();
        net.getClaim($stateParams.claimId).then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
            deferred.reject();
          }
        );
        return deferred.promise;
      }],
      claimForms: ['net', '$q', '$stateParams', function(net, $q, $stateParams) {
        var deferred = $q.defer();
        net.getFormsForClaim($stateParams.claimId).then(
          function success(res) {
            deferred.resolve(res.data);
          }, function failure() {
            deferred.reject();
          }
        );
        return deferred.promise;
      }]
    }
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
          }, function failure() {
            deferred.reject();
          }
        );

        return deferred.promise;
      }]
    }
  });

  // Misc. Pages
  $stateProvider.state({
    name: 'root.faq',
    url: '/faq',
    templateUrl: 'templates/faq.html',
    controller: 'faqCtrl'
  });

  $stateProvider.state({
    name: 'root.aboutus',
    url: '/about-us',
    templateUrl: 'templates/aboutus.html'
  });

  $stateProvider.state({
    name: 'root.support',
    url: '/support',
    templateUrl: 'templates/support.html',
    controller: 'supportCtrl'
  });

}]);

'use script';
var app = angular.module('vetafiApp');
app.directive('vfiBreadcrumbs', function () {
  return {
    restrict: 'E',
    templateUrl: '../templates/breadcrumbs.html',
    link: function(scope, element, attrs) {
      scope.links = [
        {
          title: 'Start'
        },
        {
          title: 'Fill Forms'
        },
        {
          title: 'Review'
        },
        {
          title: 'Submit'
        }
      ];

      function init() {
        if (attrs.page) {
          var pageNum = Number(attrs.page);
          pageNum = Math.min(pageNum, scope.links.length - 1);
          pageNum = Math.max(pageNum, 0);

          for (var i = 0; i <= pageNum; i++) {
            scope.links[i].lighten = true;
          }
          scope.links[pageNum].current = true;
        }
      }

      init();
    }
  };
});

var app = angular.module('vetafiApp');
var BUSY_DELAY = 1000; // Will not show loading graphic until 1000ms have passed and we are still waiting for responses.

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('busyHttpInterceptor');
})
  .factory('busyHttpInterceptor', ['$q', '$timeout', function ($q, $timeout) {
    var counter = 0;
    return {
      request: function (config) {
        counter += 1;
        $timeout(
          function () {
            if (counter !== 0) {
              angular.element('#busy-overlay').show();
            }
          },
          BUSY_DELAY);
        return config;
      },
      response: function (response) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return response;
      },
      requestError: function (rejection) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return rejection;
      },
      responseError: function (rejection) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return rejection;
      }
    }
  }]);

var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$state', '$stateParams', 'net', '$uibModal', 'userValues', 'forms', 'formTemplateService',
  'user', 'vaService', 'claimService', '$filter',
  function($scope, $state, $stateParams, net, $uibModal, userValues, forms, formTemplateService, user, vaService, claimService, $filter) {
    $scope.claimId = $stateParams.claimId;
    $scope.vaAddress = vaService.getAddress();
    $scope.user = user.user || {};
    $scope.userEmail = $scope.user.email;
    $scope.userAddress = $scope.user.contact.address;
    $scope.emailList = [
      {
        name: 'Me',
        email: $scope.userEmail
      }
    ];
    $scope.dateToday = $filter('date')(new Date(), 'MM/dd/yyyy');

    $scope.formsList = forms;
    $scope.formsInfo = formTemplateService;

    $scope.onClickEditAddress = function () {
      openModifyContactModal();
    };

    $scope.onClickEditEmail = function () {
      openModifyEmailModal();
    };

    function openModifyContactModal() {
      var modalInstance = $uibModal.open({
        scope: $scope,
        controller: 'claimConfirmModifyAddressCtrl',
        templateUrl: 'templates/modals/confirmClaimModifyAddress.html',
        resolve: {
          address: function () {
            return _.cloneDeep($scope.userAddress);
          }
        }
      });

      modalInstance.result.then(function (address) {
        console.log("new address", address);
        $scope.userAddress = address;
      }, function () {
        console.log('modal-component dismissed at: ' + new Date());
      });
    }

    function openModifyEmailModal() {
      var modalInstance = $uibModal.open({
        scope: $scope,
        controller: 'claimConfirmModifyEmailCtrl',
        templateUrl: 'templates/modals/confirmClaimModifyEmail.html',
        resolve: {
          email: function () {
            return $scope.userEmail;
          }
        }
      });

      modalInstance.result.then(function (email) {
        $scope.userEmail = email;
      }, function () {
        console.log('modal-component dismissed at: ' + new Date());
      });
    }

    $scope.onClickConfirm = function () {
      var data = {
        toAddress: $scope.vaAddress,
        fromAddress: $scope.userAddress,
        emails: [$scope.userEmail],                       // copies sent to which emails
        addresses: [$scope.vaAddress, $scope.userAddress] // copies sent to which addresses
      };
      net.submitClaim($stateParams.claimId, data)
        .then(function (resp) {
          if (resp) {
            claimService.submitCurrentClaim();
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId});
          } else {
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId, error: 'unknown'});
          }
        }).catch(function (data) {
          $state.go("root.claimsubmit", {claimId: $stateParams.claimId, error: 'unknown'});
        });
    };
  }
]);

var app = angular.module('vetafiApp');
app.controller('claimConfirmModifyAddressCtrl', ['$scope', 'address',
  function($scope, address) {
    $scope.address = address;
  }
]);

var app = angular.module('vetafiApp');
app.controller('claimConfirmModifyEmailCtrl', ['$scope', 'email',
  function($scope, email) {
    $scope.email = email;
  }
]);

var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams', '$state', 'claimForms',
  function($scope, claimService, formTemplateService, $stateParams, $state, claimForms) {
    $scope.claimId = $stateParams.claimId;

    // claimForms is an array of form objects associated with claim
    // myForms is a mapping of formId -> claimForm object
    $scope.myForms = _.keyBy(claimForms, function(form) {
      return form.key;
    });
    // All available forms
    $scope.allForms = formTemplateService;

    $scope.numRequiredCompleted = _.sum(_.map(claimForms, function (form) {
      return form && form.answeredRequired == form.requiredQuestions ? 1 : 0;
    }));
    $scope.numRequiredForms = _.sum(_.map($scope.allForms, function (form) {
      return form.vfi && form.vfi.required ? 1 : 0;
    }));

    $scope.isCompletedForm = function(myForm) {
      return myForm && myForm.answeredRequired > 0 && myForm.answeredRequired >= myForm.requiredQuestions;
    };

    $scope.onClickCancel = function() {
      $state.go('root.home');
    };

    $scope.onClickDone = function() {
      $state.go('root.claimconfirm', {claimId: $stateParams.claimId}).then(
        function success() {},
        function failure(err) {
          console.error(err);
        }
      );
    };
  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', [
  function() {
    var defaultClaim = {
      state: undefined,
      tosAccepted: false
    };
    var state = {
      INCOMPLETE: 'incomplete',
      SUBMITTED: 'submitted',
      DISCARDED: 'discarded'
    };
    return {
      /*
       * This is used to track front-end properties
       * of current claim
       */
      currentClaim: defaultClaim,
      clearClaim: function() {
        this.currentClaim = defaultClaim;
      },
      setClaim: function(claim) {
        this.currentClaim = claim;
        this.currentClaim.tosAccepted = true;
      },
      createNewClaim: function() {
        this.currentClaim.state = state.INCOMPLETE;
      },
      hasIncompleteClaim: function() {
        return this.currentClaim ? this.currentClaim.state == state.INCOMPLETE : false;
      },
      submitCurrentClaim: function() {
        this.currentClaim.state = state.SUBMITTED;
      },
      discardCurrentClaim: function() {
        this.currentClaim.state = state.DISCARDED;
        this.currentClaim.tosAccepted = false;
      },
      acceptedTos: function() {
        return this.currentClaim.tosAccepted;
      },
      acceptTos: function(accepted) {
        this.currentClaim.tosAccepted = accepted;
      },
    };
  }
]);

var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$state', 'net', 'claimService', '$uibModal', 'Profile',
  function ($scope, $state, net, claimService, $uibModal, Profile) {
    $scope.isSignedIn = Profile.isSetUser();

    function callStartClaim() {
      net.startClaim(
        {forms: ["VBA-21-0966-ARE"]} // hardcoded to create claim with only this form for now
      ).then(function (res) {
        claimService.createNewClaim();
        $state.transitionTo('root.claimselect', {claimId: res.data.claim._id});
      });
    }

    $scope.onClickNext = function () {
      if (!claimService.acceptedTos()) {
        var tosModal = $uibModal.open({
          controller: 'tosCtrl',
          templateUrl: 'templates/tos.html',
          backdrop: 'static'
        });
        tosModal.result.then(function(res) {
          if (res) {
            callStartClaim();
          }
        }, function () {
          console.log('tos modal dismissed');
        });
      }
    };
  }
]);

var app = angular.module('vetafiApp');
app.controller('claimSubmittedCtrl', ['$scope', '$location',
  function($scope, $location) {
    // Make it simple. It's either successful or an unknown failure.
    // In the future, we can help people correct any mistakes, if possible.
    $scope.rejected = Boolean($location.search().error);
  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'net', 'claimService', 'Profile', 'formTemplateService', 'claim', 'claimForms', '$filter',
  function($scope, $stateParams, net, claimService, Profile, formTemplateService, claim, claimForms, $filter) {
    $scope.user = Profile.user.user;
    $scope.claim = claim.claim;
    $scope.claim.forms = claimForms;
    $scope.claimId = $stateParams.claimId;
    $scope.isEmailCollapsed = false;
    $scope.isAddressCollapsed = false;

    function init() {
      // Initialiaze form array
      _.forEach($scope.claim.forms, function(form) {
        form.name = formTemplateService[form.key].vfi.title;
      });

      $scope.claim.date = $filter('date')(new Date($scope.claim.stateUpdatedAt), 'MM/dd/yyyy');
    }

    init();
  }
]);

var app = angular.module('vetafiApp');

app.filter('unsafe', function($sce) {
  return $sce.trustAsHtml; }
);

app.controller('faqCtrl', ['$scope', function($scope) {
  $scope.sections = [
    {
      title: "How does Vetafi work?",
      content: "Vetafi helps U.S. Veterans file health benefit claims to the U.S. Department of Veteran Affairs. We ask you easy-to-answer questions about your military background and life situation and help you fill in all the correct forms. Your answers tell us how else we can help you and what other information you can include to get the best possible benefits.",
      tags: ['health', 'claim', 'for me']
    },
    {
      title: "Who is Vetafi for?",
      content: "Vetafi mainly helps to serve the U.S. Veterans and Servicemember community. Our main objective is to provide an easy to use tool to help members complete and submit benefit claims so they may receive the best possible benefits.",
      tags: ['veteran', 'veterans', 'service', 'member', 'user', 'audience']
    },
    {
      title: "How much is it to use Vetafi?",
      content: "Vetafi is completely free!",
      tags: ['price', 'cost', 'dollars', 'money']
    },
    {
      title: "What is a VA claim?",
      html: "A claim is a set of completed forms and medical records you may send to the VA to receive compensation, pension, and survivor benefits for you and your family. You may view more detailed information about VA benefits claims <a href='http://www.benefits.va.gov/COMPENSATION/fdc.asp'>here</a>.",
      tags: []
    },
    {
      title: "How does a claim get processed?",
      html: "When the U.S. Department of Veteran Affairs receives your claim, they will review the completed forms and medical records you've submitted. Representatives will then review and cross-check with their records to reach a decision. Once the decision is approved by a committee, they will send you mail with next steps. You may view more detailed information about how claims are processed <a href='http://www.benefits.va.gov/compensation/process.asp'>here</a>.",
      tags: ['Veteran Affairs']
    },
    {
      title: "What is an Intent to File form?",
      content: "Form VA 21-0966 (Intent to File) serves to notify the VA of your intent to file for benefits. Even if your claim fails to process, your benefits effective date will still be the date the VA receives this form.",
      tags: []
    },
    {
      title: "What is an Effective Date?",
      html: "<p>An Effective Date determines when benefits start to apply for a member. This Effective Date is determined based on when the VA receives your claim and how long it takes to finish processing it. An Intent to File form helps you secure your Effective Date on the date the VA receives that form - even if you have not completed your claim. You may view more detailed information about how claims are processed <a href='http://www.benefits.va.gov/compensation/effective_dates.asp'>here</a>.</p>",
      tags: []
    },
    {
      title: "How do I start filing for a claim?",
      html: "Vetafi can help you start filing a claim <a href='#/app/claim/start'>here</a>. It will be easy!",
      tags: []
    },
    {
      title: "Why is there only one form to select?",
      html: "Vetafi only supports Form VA 21-0966 at the moment. We will be supporting more forms in the near future! You can see more forms that may be applicable to you <a href='http://www.va.gov/vaforms/'>here</a>.",
      tags: []
    },
    {
      title: "Does Vetafi save my information? Is it safe?",
      html: "Vetafi saves information that you enter so you don't have to enter that information again. Even if you leave this website, you can always come back to finish your uncompleted claim right where you left off! Vetafi will not release or share your personal information to any individual, third-parties, organizations or companies. All information collected is strictly to serve Vetafi's objectives and enhance your experience. You can view our Terms of Service <a href='#/app/tos'>here</a>.",
      tags: []
    },
    {
      title: "I've submitted a claim, now what?",
      html: "From here, all you have to do is wait and check the mail! Once the U.S. Department of Veteran Affairs is finished processing your claim, they will send you a benefit package in the mail. In the mean time, you may view your submitted claims on Vetafi <a href='#/app/profile/claims'>here</a>.",
      tags: ['process', 'wait', 'long']
    },
    {
      title: "How long does it take for the VA to process my claim?",
      html: "Due to the sheer number of claims to process and limited resources, it can take the U.S. Department of Veteran Affairs several weeks to a few months to finish processing your claim. The wait time usually depends on how complicated the claim is. You can view more information about claim processing time <a href='http://www.benefits.va.gov/compensation/process.asp'>here</a>.",
      tags: ['Veteran Affairs', 'wait']
    }
  ];

  $scope.searchText = '';
  $scope.onSearchChange = function() {
  };
  $scope.cancelSearch = function() {
    $scope.searchText = '';
  };

}]);

var app = angular.module('vetafiApp');
app.directive('vfiFooter', ['Profile', function (Profile) {
  return {
    restrict: 'E',
    templateUrl: '../templates/footer.html',
    link: function(scope) {
      scope.isSignedIn = Profile.isSetUser();
    }
  };
}]);

/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formTemplateService',
  '$stateParams', '$state', 'userValues', '$window', 'net', '$interval',
    function ($scope, $filter, $rootScope, formTemplateService,
              $stateParams, $state, userValues, $window, net, $interval) {
      $scope.title = formTemplateService[$stateParams.formId].vfi.title;
      $scope.description = formTemplateService[$stateParams.formId].vfi.description;
      $scope.claimId = $stateParams.claimId;
      $scope.formId = $stateParams.formId;

      $scope.$watch('signature', function (newVal) {
        if (newVal) {
          $scope.model.signature = newVal;
        } else {
          delete $scope.model.signature;
        }
      });

      function currentDate() {
        return $filter('date')(new Date(), 'MM/dd/yyyy');
      }

      $scope.onSubmit = function () {
        save(true).then(
          function () {
            $state.go('root.claimselect', {claimId: $stateParams.claimId}).then(
              function success() {
              },
              function failure(err) {
                console.error(err);
              }
            );
          });
      };

      $scope.onSave = function () {
        save(true)
      };

      var lastParams = null;
      function save(force) {
        if (lastParams == null || !_.isEqual(lastParams, $scope.model) || force === true) {
          lastParams = _.clone($scope.model);
          return net.saveForm($stateParams.claimId, $stateParams.formId, $scope.model);
        }
      }

      var saveIntervalPromise = $interval(save, 1000);
      $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $interval.cancel(saveIntervalPromise)
      });

      $scope.model = userValues.values.values; // TODO(jeff) fix extra attributes messing up completion percentage
      $scope.signature = $scope.model.signature;
      $scope.fields = formTemplateService[$stateParams.formId].fields;
      $scope.fieldsByKey = _.keyBy(formTemplateService[$stateParams.formId].fields, 'key');

      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i].key.indexOf('date_signed') !== -1) {
          $scope.model[$scope.fields[i].key] = currentDate();
        }
      }

      function countAnswerable() {
        var total = 0;
        for (var i = 0; i < $scope.fields.length; i++) {
          if (!$scope.fields[i].templateOptions.optional) {
            if ($scope.fields[i].hasOwnProperty('hideExpression')) {
              if (!$scope.$eval($scope.fields[i].hideExpression)) {
                total += 1;
              }
            } else {
              total += 1;
            }
          }
        }
        return total + 1; // Plus one for signature.
      }

      function countAnswered(model) {
        var k, count = 0;
        for (k in $scope.fieldsByKey) {
          if ($scope.fieldsByKey.hasOwnProperty(k)) {
            if (model.hasOwnProperty(k) && model[k] !== '' && !$scope.fieldsByKey[k].templateOptions.optional) {
              count++;
            }
          }
        }

        if (model.signature) {
          count++;
        }

        return count;
      }

      $scope.answered = 0;
      $scope.answerable = 0;

      $scope.getProgress = function () {
        return ($scope.answered / $scope.answerable) * 100.0;
      };

      $scope.updateProgress = function() {
        $scope.answered = countAnswered($scope.model);
        $scope.answerable = countAnswerable($scope.model);
      };

      $scope.$watch('model', function () {
        $scope.updateProgress();
      }, true)
    }]);

var app = angular.module('vetafiApp');

app.run(['formlyConfig', 'MomentJS', function (formlyConfig, moment) {
  // Set different form types, this allows us to specify validators that will be used
  // in the form schemas.
  function updateViewWithParsed(scope, element) {
    /**
     * Update view with parsed value as user is typing.
     */
    element.on('input', function() {
      scope.fc.$setViewValue(scope.fc.$$rawModelValue);
      scope.fc.$render();
    });
  }

  formlyConfig.setType({
    name: 'phoneNumber',
    defaultOptions: {
      "templateOptions": {
        placeholder: '000-000-0000'
      },
      link: updateViewWithParsed,
      validators: {
        phoneNumber: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /\d{3}-\d{3}-\d{4}/.test(viewValue);
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }
        value = value.replace(new RegExp('[^0-9]', 'g'), '');
        var first = value.substr(0, 3);
        var second = value.substr(3, 3);
        var third = value.substr(6, 4);

        if (first.length <= 3 && second.length == 0) {
          return first;
        }

        if (first.length == 3 && second.length > 0 &&
          second.length <= 3 && third.length == 0) {
          return first + '-' + second;
        }

        if (second.length == 3 && third.length > 0) {
          return first + '-' + second + '-' + third;
        }
      }]
    }
  });

  formlyConfig.setType({
    name: 'ssn',
    defaultOptions: {
      "templateOptions": {
        placeholder: '000-00-0000'
      },
      link: updateViewWithParsed,
      validators: {
        ssn: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /\d{3}-\d{2}-\d{4}/.test(viewValue);
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }
        value = value.replace(new RegExp('[^0-9]', 'g'), '');
        var first = value.substr(0, 3);
        var second = value.substr(3, 2);
        var third = value.substr(5, 4);

        if (first.length <= 3 && second.length == 0) {
          return first;
        }

        if (first.length == 3 && second.length == 0) {
          return first + '-';
        }

        if (first.length == 3 && second.length > 0 &&
          second.length <= 2 && third.length == 0) {
          return first + '-' + second;
        }

        if (second.length == 2 && third.length > 0) {
          return first + '-' + second + '-' + third;
        }
      }]
    }
  });

  formlyConfig.setType({
    name: 'zipCode',
    defaultOptions: {
      "templateOptions": {
        placeholder: '00000'
      },
      link: updateViewWithParsed,
      validators: {
        zipCode: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /\d{5}/.test(viewValue);
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }
        return value.replace(new RegExp('[^0-9]', 'g'), '').substring(0, 5);
      }]
    }
  });

  formlyConfig.setType({
    name: 'state',
    defaultOptions: {
      "templateOptions": {
        placeholder: 'XX'
      },
      link: updateViewWithParsed,
      validators: {
        state: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /^[A-Z]{2}$/.test(viewValue);
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }
        return value.toUpperCase().replace(new RegExp('[^A-Z]', 'g'), '').substring(0, 2);
      }]
    }
  });

  formlyConfig.setType({
    name: 'country',
    defaultOptions: {
      "templateOptions": {
        placeholder: 'US'
      },
      link: updateViewWithParsed,
      validators: {
        state: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /^[A-Z]{2}$/.test(viewValue);
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }
        return value.toUpperCase().replace(new RegExp('[^A-Z]', 'g'), '').substring(0, 2);
      }]
    }
  });

  formlyConfig.setType({
    name: 'date',
    defaultOptions: {
      "templateOptions": {
        placeholder: 'MM/DD/YYYY'
      },
      link: updateViewWithParsed,
      validators: {
        zipCode: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return moment(viewValue, 'MM/DD/YYYY', true).isValid();
        }
      },
      parsers: [function (value) {
        if (!value) {
          return '';
        }

        value = value.replace(new RegExp('[^0-9]', 'g'), '');
        var first = value.substr(0, 2);
        var second = value.substr(2, 2);
        var third = value.substr(4, 4);

        if (first.length <= 2 && second.length == 0) {
          return first;
        }

        if (first.length == 2 && second.length > 0 &&
          second.length <= 2 && third.length == 0) {
          return first + '/' + second;
        }

        if (second.length == 2 && third.length > 0) {
          return first + '/' + second + '/' + third;
        }
      }]
    }
  });

  formlyConfig.setType({
    name: 'email',
    defaultOptions: {
      "templateOptions": {
        placeholder: 'yourname@website.com'
      },
      validators: {
        zipCode: function (viewValue) {
          if (!viewValue) {
            return true;
          }
          return /.+@.+\..+/.test(viewValue);
        }
      }
    }
  });
}]);

'use strict';
var app = angular.module('vetafiApp');
app.controller("headerCtrl",
  ['$scope', 'Profile', 'claimService', 'net', '$window', '$interval', '$uibModal',
    function ($scope, Profile, claimService, net, $window, $interval, $uibModal) {
      $scope.isSignedIn = Profile.isSetUser();

      //
      // Header Menu
      //
      $scope.menuToggled = false;
      $scope.onToggleMenu = function () {
        $scope.menuToggled = !$scope.menuToggled;
      };

      $scope.closeThisMenu = function () {
        $scope.menuToggled = false;
      };

      function ExpirationChecker() {
        this.active = false;
      }

      ExpirationChecker.prototype.checkSessionExpiration = function () {
        if (this.active) {
          return;
        }

        var that = this;
        net.touchSession().then(function success() {
        }, function failure() {
          that.active = true;
          var newScope = $scope.$new(true);
          newScope.headline = "Session Expired";
          newScope.message = "For security reasons, your session has expired due to inactivity. Please log back in to continue your work.";
          var modal = $uibModal.open({
            scope: newScope,
            templateUrl: 'templates/modals/oneButtonModal.html',
            windowClass: 'ngdialog-theme-default'
          });
          modal.result.then(function() {
            that.active = false;
            $window.location.href = '/login';
          });
        });
      };

      var expirationChecker = new ExpirationChecker();

      $interval(function() {
        expirationChecker.checkSessionExpiration();
      }, 20 * 60 * 1000); // check every 20 minutes
    }]
);

var app = angular.module('vetafiApp');
app.controller('homeCtrl', ['$scope', 'Profile', 'claimService',
  function($scope, Profile, claimService) {
    $scope.isSignedIn = Profile.isSetUser();
    $scope.hasIncompleteClaim = claimService.hasIncompleteClaim();
    $scope.currentClaim = claimService.currentClaim || {};
  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.directive("modalChangePassword", ["net", function(net) {
    return {
        restrict: "A",
        link: function(scope) {
            scope.errorMsg = '';
            function displayError(msg) {
              scope.errorMsg = msg;
            }

            scope.savePassword = function() {
              if (!scope.oldPwd) {
                displayError("Please enter your old password.");
                return;
              }

              if (!scope.newPwd) {
                displayError("Please enter a new password.");
                return;
              }

              if (scope.newPwd && scope.newPwd.length < 6) {
                displayError("Your new password is too short.");
                return;
              }

              if (scope.confirmPwd != scope.newPwd) {
                displayError("Your new password and confirm password do not match! Please re-type your new password.");
                return;
              }

              if (scope.newPwd == scope.oldPwd) {
                displayError("Your new password cannot match your old password.");
                return;
              }

              net.changePassword(scope.oldPwd, scope.newPwd).then(
                function() { // success case
                  scope.$close();
                }, function(errResp) { // failed case
                  if ('auth_mismatch' == errResp.data) {
                    displayError("Incorrect current password.");
                  } else {
                    displayError("Sorry, unknown server issue. Please try again later.");
                  }
                }
              );
            };
        }
    }
}]);

'use strict';
var app = angular.module('vetafiApp');
app.controller('editProfileCtrl', ['$scope', 'user', 'net', 'Profile',
  function($scope, user, net, Profile) {
    $scope.userDraft = _.cloneDeep(user);

    function validateEmail(email) {
      if (!email) {
        return false;
      }
      var atInd = email.indexOf('@');
      var dotInd = email.indexOf('.');
      return atInd > -1 && dotInd > atInd;
    }

    function validateEmails() {
      return $scope.userDraft.email == user.email ||
          (
            validateEmail($scope.userDraft.email)
            && validateEmail($scope.userDraft.confirmEmail)
            && $scope.userDraft.email == $scope.userDraft.confirmEmail
          );
    }

    $scope.allFilled = function() {
      return $scope.userDraft.firstname && $scope.userDraft.lastname
        && validateEmails()
        && $scope.userDraft.contact.address.name
        && $scope.userDraft.contact.address.street1
        && $scope.userDraft.contact.address.country
        && $scope.userDraft.contact.address.city
        && $scope.userDraft.contact.address.province
        && $scope.userDraft.contact.address.postal;
    };

    $scope.saveInfo = function() {
      if (!$scope.allFilled()) {
        return;
      }

      net.editUserInfo($scope.userDraft).then(
        function(resp) { // success case
          var updatedUser = resp.data.user;
          Profile.setUser(updatedUser);
          $scope.$close(updatedUser);
        }, function(errResp) { // failed case
          console.log('Woops error ' + JSON.stringify(errResp));
        }
      );
    };

    //
    // Template Constants
    //

    $scope.nameGroup = {
      feedbackFn: function() { return $scope.userDraft.firstname && $scope.userDraft.lastname ? 'has-success' : 'has-error'; },
      fields: [
        {
          label: 'First name',
          ngModel: 'firstname',
          placeholder: 'Enter your first name'
        },
        {
          label: 'Middle name',
          ngModel: 'middlename',
          placeholder: 'Enter your middle name (if any)'
        },
        {
          label: 'Last name',
          ngModel: 'lastname',
          placeholder: 'Enter your last name'
        }
      ]
    };

    $scope.emailGroup = {
      feedbackFn: function() { return validateEmails() ? 'has-success' : 'has-error'; },
      fields: [
        {
          label: 'Primary email',
          ngModel: 'email',
          placeholder: 'Enter your email address'
        },
        {
          label: 'Confirm email',
          ngModel: 'confirmEmail',
          placeholder: 'Re-enter your email address (if changing email)'
        }
      ]
    };

    $scope.validateAddressField = function(field) {
      if (field.ngModel == 'street2') { // optional fields
        return '';
      }
      return $scope.userDraft.contact.address[field.ngModel] ? 'has-success' : 'has-error';
    };

    $scope.addressGroup = [
      {
        label: 'Address Name',
        ngModel: 'name',
        placeholder: 'Name of address i.e. Home, Work, etc.'
      },
      {
        label: 'Street address',
        ngModel: 'street1',
        placeholder: 'i.e. 1234 Washington St'
      },
      {
        label: '',
        ngModel: 'street2',
        placeholder: 'i.e. Room, Apartment, Suite No. (if any)'
      },
      {
        label: 'Country',
        ngModel: 'country',
        placeholder: 'Country of residence'
      },
      {
        label: 'City',
        ngModel: 'city',
        placeholder: 'City of residence'
      },
      {
        label: 'State / Province',
        ngModel: 'province',
        placeholder: 'State or province'
      },
      {
        label: 'Zip / Postal',
        ngModel: 'postal',
        placeholder: 'Zip or Postal code'
      },
    ];

  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['xhrEnv', '$http', function(xhrEnv, $http) {

  var httpGet = function (url) {
    return $http({
      url: "/api" + url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    return $http({
      url: "/api" + url,
      method: "POST",
      data: data || {},
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpDelete = function(url) {
    return $http.delete(url);
  };

  return {
    touchSession: function() {
      return httpGet("/session/touch");
    },
    getAuthIdMeUrl: function() {
      return '/auth/idme';
    },
    changePassword: function(oldPwd, newPwd) {
      var data = {
        old: oldPwd,
        new: newPwd
      };
      return httpPost("/auth/password", data);
    },

    // User
    getUserInfo: function() {
      return httpGet("/user");
    },
    getUserValues: function() {
      return httpGet("/user/values");
    },
    editUserInfo: function(data) {
      return httpPost("/user", data);
    },
    deleteUserAccount: function() {
      return httpDelete("/user");
    },

    // Claims
    getClaimsForUser: function() {
      return httpGet("/claims");
    },
    startClaim: function(data) {
      return httpPost("/claims/create", data);
    },
    submitClaim: function(claimId, data) {
      return httpPost("/claim/" + claimId + "/submit", data);
    },
    discardClaim: function(claimId) {
      return httpDelete("/claim/" + claimId);
    },
    getClaim: function(claimId) {
      return httpGet("/claim/" + claimId);
    },
    getFormsForClaim: function(claimId) {
      return httpGet("/claim/" + claimId + "/forms");
    },
    saveForm: function(claimId, formId, data) {
      return httpPost('/save/' + claimId + '/' + formId, data);
    },
    downloadForm: function(claimId, formId) {
      return httpGet("/claim/" + claimId + "/form/" + formId + "/pdf");
    }
  };
}]);

'use strict';
var app = angular.module('vetafiApp');
app.controller('profileCtrl', ['$scope', '$location', '$window', 'Profile', 'claimService', 'net', '$uibModal', '$state', 'userClaims', '$filter',
  function($scope, $location, $window, Profile, claimService, net, $uibModal, $state, userClaims, $filter) {
    $scope.user = Profile.user.user;
    $scope.claims = userClaims.claims;

    function createHeaderString(claim) {
      if (claim.state == 'incomplete') {
        return 'Started (incomplete)';
      } else if (claim.state == 'submitted') {
        return 'Submitted';
      }
    }

    function init() {
      for (var i = 0; i < $scope.claims.length; i++) {
        $scope.claims[i].id = $scope.claims[i]._id;
        $scope.claims[i].header = createHeaderString($scope.claims[i]);
        $scope.claims[i].date = $filter('date')(new Date($scope.claims[i].stateUpdatedAt), 'MM/dd/yyyy');
      }
    }
    init();

    $scope.clickEditInfo = function() {
      var newScope = $scope.$new(true);
      newScope.headline = "Edit General Information";
      var modalInstance = $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/editProfile.html',
        windowClass: 'ngdialog-theme-default',
        controller: 'editProfileCtrl',
        resolve: {
          user: function () {
            return $scope.user;
          }
        }
      });
      modalInstance.result.then(function (user) {
        $scope.user = user;
      }, function () {
        console.log('modal dismissed');
      });
    };

    $scope.clickChangePassword = function() {
      var newScope = $scope.$new(true);
      newScope.headline = "Change Password";
      $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/changePassword.html',
        windowClass: 'ngdialog-theme-default'
      });
    };

    $scope.clickLinkIdMe = function() {
      // Redirect to IdMe auth page, which will redirect to the specified uri setup with IdMe.
      $window.location.href = net.getAuthIdMeUrl();
    };

    $scope.clickDeleteAccount = function() {
      var newScope = $scope.$new(true);
      newScope.headline = "Delete Account";
      newScope.message = "Are you sure you want to delete your account? All your saved personal information will be lost.";
      newScope.choice = 'warning';
      newScope.continueText = 'Delete';
      var modal = $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/twoButtonModal.html',
        windowClass: 'ngdialog-theme-default'
      });
      modal.result.then(function() {
        net.deleteUserAccount().then(function(resp) {
          Profile.logout();
          if (resp.status == 200) {
            $location.path('/');
          }
        });
      });
    };
  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.service('Profile', ['claimService', '$q', 'net', function(claimService, $q, net) {
    this.user = null;

    this.logout = function() {
      claimService.clearClaim();
      this.unsetUser();
    };

    this.setUser = function(user) {
      this.user = user;
    };

    this.unsetUser = function() {
      this.user = null;
    };

    this.isSetUser = function() {
      return this.user != null;
    };

    this.getUser = function() {
      return this.user;
    };

    this.resolveUser = function() {
      var deferred = $q.defer();

      var that = this;
      net.getUserInfo().then(function success(res) {
        if (res.status === 200) {
          that.setUser(res.data);
          deferred.resolve(res.data);
        } else {
          deferred.resolve(null);
        }
      }, function failure() {
        // Eventually this should be failure
        // and we should handle a redirect to the login page
        deferred.resolve(null);
      });

      return deferred.promise;
    };
}]);

/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('signature', []);

angular.module('signature').directive('signaturePad', ['$window', '$timeout',
  function ($window, $timeout) {
    'use strict';

    var signaturePad, canvas, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='; // eslint-disable-line
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="signature"><canvas class="signature-canvas" ng-mouseup="updateModel()"></canvas></div>',
      scope: {
        clear: '=',
        dataurl: '='
      },
      controller: [
        '$scope',
        function ($scope) {
          $scope.updateModel = function () {
            /*
             defer handling mouseup event until $scope.signaturePad handles
             first the same event
             */
            $timeout()
              .then(function () {
                $scope.dataurl = $scope.signaturePad.isEmpty() ? undefined : $scope.signaturePad.toDataURL();
              });
          };

          $scope.clear = function () {
            $scope.signaturePad.clear();
            $scope.dataurl = undefined;
          };

          $scope.$watch('dataurl', function (dataUrl) {
            if (dataUrl) {
              $scope.signaturePad.fromDataURL(dataUrl);
            }
          });
        }
      ],
      link: function (scope, element) {
        canvas = element.find('canvas')[0];
        scope.signaturePad = new SignaturePad(canvas); // eslint-disable-line

        scope.onResize = function() {
          var canvas = element.find('canvas')[0];
          var ratio =  Math.max($window.devicePixelRatio || 1, 1);
          canvas.width = element[0].clientWidth * ratio;
          canvas.height = element[0].clientHeight * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
        };

        scope.onResize();

        angular.element($window).bind('resize', function() {
            scope.onResize();
        });

        // listen to touchend event and updateModel when event is fired
        element.on('touchend', function () {
            scope.$apply(scope.updateModel);
        });
      }
    };
  }
]);

// Backward compatibility
angular.module('ngSignaturePad', ['signature']);

var app = angular.module('vetafiApp');
app.controller('supportCtrl', ['$scope', 'Profile', function($scope, Profile) {
  $scope.user = Profile.getUser() ? Profile.getUser().user : undefined;
  $scope.userName = $scope.user && $scope.user.firstname ? $scope.user.firstname + " " + $scope.user.lastname : undefined;
  $scope.userEmail = $scope.user ? $scope.user.email : undefined;
}]);

var app = angular.module('vetafiApp');
app.controller('tosCtrl', ['$scope', '$location', 'claimService',
  function($scope, $location, claimService) {
    $scope.atTosPage = $location.path() == '/app/tos';
    $scope.accept = false;

    $scope.onAccept = function() {
      if ($scope.accept) {
        claimService.acceptTos(true);
        if (typeof $scope.$close !== 'undefined') {
          $scope.$close(true);
        }
      } else {
        $('.vfi-error-msg').text('You must check the checkbox above to agree and continue.');
      }
    };

    $scope.onDecline = function() {
      $scope.$close();
      $location.path('/');
    };

    $scope.termsSections = [
      {
        header: "General Terms and Conditions",
        paragraphs: [
          "Be sure to read the Terms of Service below, as they cover the terms and conditions that apply to your use of Vetafi.org (the \"Website,\" or \"Site\").",
          "By accessing and using this Site, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services, which may be posted and modified from time to time. All such guidelines or rules are hereby incorporated by reference into the Terms of Service.",
          "In consideration of use of the Site, you agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the registration page and (b) to maintain and update this information to keep it true, accurate, current and complete. If any information provided by you is untrue, inaccurate, not current or incomplete, Vetafi has the right to terminate your account and refuse any and all current or future use of the Site. You agree not to resell or transfer the Site or use of or access to the Site.",
          "You acknowledge and agree that you must: (a) provide for your own access to the World Wide Web and pay any service fees associated with such access, and (b) provide all equipment necessary for you to make such connection to the World Wide Web, including a computer and modem or other access device.",
          "By using the Vetafi.org web site, including any applets, software, and content contained therein, you agree that use of the Site is entirely at your own risk. THE SITE IS PROVIDED \"AS IS,\" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, ANY WARRANTY FOR INFORMATION, DATA, SERVICES, UNINTERRUPTED ACCESS, OR PRODUCTS PROVIDED THROUGH OR IN CONNECTION WITH THE SITE. SPECIFICALLY, Vetafi DISCLAIMS ANY AND ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO: (1) ANY WARRANTIES CONCERNING THE AVAILABILITY, ACCURACY, USEFULNESS, OR CONTENT OF INFORMATION, PRODUCTS OR SERVICES AND (2) ANY WARRANTIES OF TITLE, WARRANTY OF NON-INFRINGEMENT, WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. THIS DISCLAIMER OF LIABILITY APPLIES TO ANY DAMAGES OR INJURY CAUSED BY ANY FAILURE OF PERFORMANCE, ERROR, OMISSION, INTERRUPTION, DELETION, DEFECT, DELAY IN OPERATION OR TRANSMISSION, COMPUTER VIRUS, COMMUNICATION LINE FAILURE, THEFT OR DESTRUCTION OR UNAUTHORIZED ACCESS TO, ALTERATION OF, OR USE OF RECORD, WHETHER FOR BREACH OF CONTRACT, TORTUOUS BEHAVIOR, NEGLIGENCE, OR UNDER ANY OTHER CAUSE OF ACTION.",
          "NEITHER VETAFI NOR ANY OF ITS EMPLOYEES, AGENTS, SUCCESSORS, ASSIGNS, AFFILIATES, WEBSITE CO-BRANDING PROVIDERS OR CONTENT OR SERVICE PROVIDERS SHALL BE LIABLE TO YOU OR OTHER THIRD PARTY FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF USE OF SERVICE OR INABILITY TO GAIN ACCESS TO OR USE THE SERVICE OR OUT OF ANY BREACH OF ANY WARRANTY. BECAUSE SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, THE ABOVE LIMITATION MAY NOT APPLY TO YOU. IN SUCH STATES, THE RESPECTIVE LIABILITY OF Vetafi, ITS EMPLOYEES, AGENTS, SUCCESSORS, ASSIGNS, AFFILIATES, WEBSITE CO-BRANDING PROVIDERS AND CONTENT OR SERVICE PROVIDERS RESPECTIVE LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY SUCH STATE LAW.",
          "Vetafi reserves the right to change any information on this Website including but not limited to revising and/or deleting features or other information without prior notice. Clicking on certain links within this Website might take you to other web sites for which Vetafi assumes no responsibility of any kind for the content, availability or otherwise. The content presented at this Site may vary depending upon your browser limitations.",
          "Vetafi has no obligation to monitor the Site. However, you acknowledge and agree that Vetafi has the right to monitor the Site electronically from time to time and to disclose any information as necessary or appropriate to satisfy any law, regulation or other governmental request, to operate the Site properly, or to protect itself or its customers. Vetafi will not intentionally monitor or disclose any private electronic-mail message unless required by law. Vetafi reserves the right to refuse to post or to remove any information or materials, in whole or in part, that, in its sole discretion, are unacceptable, undesirable, inappropriate or in violation of these Terms of Service.",
          "Unless otherwise indicated for a particular communication, any communications or material of any kind that you e-mail, post or otherwise transmit through this Website, including data, questions, comments or suggestions (\"your Communications\") will be treated as non-confidential and nonproprietary. In addition, Vetafi is free to use any ideas, concepts, know-how or techniques contained in your Communications for any purpose including, but not limited to, developing and marketing products using such information without compensation to you."
        ]
      },
      {
        header: "User Conduct. While using this Site, you may not:",
        paragraphs: [
          "1. restrict or inhibit any other user from using and enjoying the Site; or",
          "2. post or transmit any unlawful, fraudulent, libelous, defamatory, obscene, pornographic, profane, threatening, abusive, hateful, offensive, or otherwise objectionable information of any kind, including without limitation any transmissions constituting or encouraging conduct that would constitute a criminal offense, give rise to civil liability, or otherwise violate any local, state, national or foreign law, including without limitation the U.S. export control laws and regulations; or",
          "3. post or transmit any advertisements, solicitations, chain letters, pyramid schemes, investment opportunities or schemes or other unsolicited commercial communication (except as otherwise expressly permitted by Vetafi) or engage in spamming or flooding; or",
          "4. post or transmit any information or software which contains a virus, trojan horse, worm or other harmful component; or",
          "5. post, publish, transmit, reproduce, distribute or in any way exploit any information, software or other material obtained through the Site for commercial purposes (other than as expressly permitted by the provider of such information, software or other material); or"
        ]
      },
      {
        header: "Failure to Comply With Terms and Conditions and Termination.",
        paragraphs: [
          "You acknowledge and agree that Vetafi may terminate your password or account or deny you access to all or part of the Site without prior notice if you engage in any conduct or activities that Vetafi in its sole discretion believes violate any of the terms and conditions, violate the rights of Vetafi, or is otherwise inappropriate for continued access.",
          "You acknowledge and agree that Vetafi may in its sole discretion deny you access through Vetafi to any materials stored on the Internet, or to access third party services, merchandise or information on the Internet through Vetafi, and Vetafi shall have no responsibility to notify any third-party providers of services, merchandise or information nor any responsibility for any consequences resulting from lack of notification.",
          "You agree to defend, indemnify and hold Vetafi and its affiliates harmless from any and all claims, liabilities, costs and expenses, including reasonable attorneys' fees, arising in any way from your use of the Site or the placement or transmission of any message, information, software or other materials through the Site by you or users of your account or related to any violation of these Terms of Service by you or users of your account."
        ]
      },
      {
        header: "Links from and to this Website.",
        paragraphs: [
          "You acknowledge and agree that Vetafi and any of its website co-branding providers have no responsibility for the accuracy or availability of information provided by linked sites. Links to external web sites do not constitute an endorsement by Vetafi or its website co-branding providers of the sponsors of such sites or the content, products, advertising or other materials presented on such sites."
        ]
      },
      {
        header: "Other Information",
        paragraphs: [
          "Vetafi is taking reasonable and appropriate measures, including encryption, to ensure that your personal information is disclosed only to those specified by you. However, the Internet is an open system and we cannot and do not guarantee that the personal information you have entered will not be intercepted by others and decrypted.",
          "The Terms of Service and the relationship between you and Vetafi shall be governed by the laws of the State of California without regard to its conflict of law provisions. You and Vetafi agree to submit to the personal and exclusive jurisdiction of the courts located within the state of California.",
          "The failure of Vetafi to exercise or enforce any right or provision of the Terms of Service shall not constitute a waiver of such right or provision. If any provision of the Terms of Service is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of the Terms of Service remain in full force and effect."
        ]
      }
    ];
  }
]);

'use strict';
var app = angular.module('vetafiApp');
app.service('vaService', function () {
  this.vaAddress = {
    street1: 'Somewhere Street',
    city: 'Washington',
    province: 'DC',
    country: 'US',
    postal: '20854',
    name: 'Department of Veteran Affairs'
  };

  this.getAddress = function () {
    return this.vaAddress;
  };
});
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "vfi": {
    "title": "Intent to File",
    "summary": "This form is used to notify VA of your intent to file for benefits. Even if your claim fails to process, your benefits effective date will still be the date the VA receives this form.",
    "required": true
  },
  "name": "INTENT TO FILE A CLAIM FOR COMPENSATION AND/OR PENSION, OR SURVIVORS PENSION AND/OR DIC",
  "description": "This Form Is Used to Notify VA of Your Intent to File for General Benefits",
  "fields": [
    {
      "key": "filing_for_self",
      "type": "radio",
      "templateOptions": {
        "label": "Are you filing for yourself, or for someone else?",
        "options": [
          {
            "name": "For myself",
            "value": true
          },
          {
            "name": "For someone else",
            "value": false
          }
        ],
        "optional": false
      },
      "defaultValue": true
    },
    {
      "key": "veteran_intent_to_file_compensation_y_n",
      "type": "radio",
      "templateOptions": {
        "label": "Do you intend to file for compensation related benefits?",
        "options": [
          {
            "name": "Yes",
            "value": "Yes"
          },
          {
            "name": "No",
            "value": "No"
          }
        ],
        "optional": false
      }
    },
    {
      "key": "veteran_intent_to_file_pension_y_n",
      "type": "radio",
      "templateOptions": {
        "label": "Do you intend to file for pension related benefits?",
        "options": [
          {
            "name": "Yes",
            "value": "Yes"
          },
          {
            "name": "No",
            "value": "No"
          }
        ],
        "optional": false
      }
    },
    {
      "key": "dependency_indemnity_compensation_y_n",
      "type": "radio",
      "templateOptions": {
        "label": "Do you intend to file for survivors pension and/or dependency and indemnity compensation?",
        "options": [
          {
            "name": "Yes",
            "value": "Yes"
          },
          {
            "name": "No",
            "value": "No"
          }
        ],
        "optional": false
      }
    },
    {
      "key": "claimant_first_name",
      "type": "input",
      "templateOptions": {
        "label": "Your First Name",
        "placeholder": "John",
        "autocomplete": "given-name",
        "optional": false
      }
    },
    {
      "key": "claimant_middle_initial",
      "type": "input",
      "templateOptions": {
        "label": "Your Middle Initial",
        "placeholder": "C",
        "autocomplete": "additional-name",
        "optional": false
      }
    },
    {
      "key": "claimant_last_name",
      "type": "input",
      "templateOptions": {
        "label": "Your Last Name",
        "placeholder": "Doe",
        "autocomplete": "family-name",
        "optional": false
      }
    },
    {
      "key": "claimant_ssn",
      "type": "input",
      "templateOptions": {
        "label": "Your Social Security Number",
        "placeholder": "000-00-0000",
        "optional": false
      },
      "optionsTypes": [
        "ssn"
      ]
    },

    {
      "key": "veteran_first_name",
      "type": "input",
      "templateOptions": {
        "label": "Veteran's First Name",
        "placeholder": "John",
        "autocomplete": "given-name",
        "optional": false
      },
      "hideExpression": "model.filing_for_self"
    },
    {
      "key": "veteran_middle_initial",
      "type": "input",
      "templateOptions": {
        "label": "Veteran's Middle Initial",
        "placeholder": "C",
        "autocomplete": "additional-name",
        "optional": false
      },
      "hideExpression": "model.filing_for_self"
    },
    {
      "key": "veteran_last_name",
      "type": "input",
      "templateOptions": {
        "label": "Veteran's Last Name",
        "placeholder": "Doe",
        "autocomplete": "family-name",
        "optional": false
      },
      "hideExpression": "model.filing_for_self"
    },
    {
      "key": "veteran_ssn",
      "type": "input",
      "templateOptions": {
        "label": "Veteran's Social Security Number",
        "placeholder": "000-00-0000",
        "optional": false
      },
      "optionsTypes": [
        "ssn"
      ],
      "hideExpression": "model.filing_for_self"
    },

    {
      "key": "veteran_dob",
      "type": "input",
      "optionsTypes": [
        "date"
      ],
      "templateOptions": {
        "label": "Veteran's Date of Birth",
        "placeholder": "MM/DD/YYYY",
        "autocomplete": "bday",
        "optional": false
      }
    },
    {
      "key": "veteran_sex",
      "type": "radio",
      "templateOptions": {
        "label": "Veteran's Gender",
        "options": [
          {
            "name": "Male",
            "value": "Male"
          },
          {
            "name": "Female",
            "value": "Female"
          }
        ],
        "optional": false
      }
    },
    {
      "key": "veterans_service_number",
      "type": "input",
      "templateOptions": {
        "label": "Veteran's Service Number (If applicable)",
        "optional": false
      }
    },

    {
      "key": "veteran_previous_claim_with_va_y_n",
      "type": "radio",
      "templateOptions": {
        "label": "Have you, or the veteran you represent, ever previously filed a claim with the VA?",
        "options": [
          {
            "name": "Yes",
            "value": "Yes"
          },
          {
            "name": "No",
            "value": "No"
          }
        ],
        "optional": false
      }
    },
    {
      "key": "va_file_number",
      "type": "input",
      "templateOptions": {
        "label": "VA File Number",
        "placeholder": "000000000",
        "optional": false
      },
      "hideExpression": "model.veteran_previous_claim_with_va_y_n != 'Yes'"
    },

    {
      "key": "veteran_home_address_line1",
      "type": "input",
      "templateOptions": {
        "label": "Address Line 1",
        "placeholder": "55 Magnolia St.",
        "autocomplete": "address-line1",
        "optional": false
      }
    },
    {
      "key": "veteran_home_apartment_number",
      "type": "input",
      "templateOptions": {
        "label": "Apartment Number",
        "placeholder": "Apt. 3",
        "autocomplete": "address-line3",
        "optional": true
      }
    },
    {
      "key": "veteran_home_city",
      "type": "input",
      "templateOptions": {
        "label": "City",
        "placeholder": "Kansas City",
        "autocomplete": "address-level2",
        "optional": false
      }
    },
    {
      "key": "veteran_home_state",
      "type": "input",
      "optionsTypes": [
        "state"
      ],
      "templateOptions": {
        "label": "State",
        "autocomplete": "address-level1",
        "optional": false
      }
    },
    {
      "key": "veteran_home_zip_code",
      "type": "input",
      "optionsTypes": [
        "zipCode"
      ],
      "templateOptions": {
        "label": "Postal Code",
        "autocomplete": "postal-code",
        "optional": false
      }
    },
    {
      "key": "veteran_home_country",
      "type": "input",
      "optionsTypes": [
        "country"
      ],
      "templateOptions": {
        "label": "Country",
        "autocomplete": "country",
        "optional": false
      }
    },

    {
      "key": "contact_phone_number",
      "type": "input",
      "optionsTypes": [
        "phoneNumber"
      ],
      "templateOptions": {
        "label": "Contact Phone Number",
        "autocomplete": "tel",
        "optional": false
      }
    },
    {
      "key": "contact_email",
      "type": "input",
      "optionsTypes": [
        "email"
      ],
      "templateOptions": {
        "label": "Contact Email",
        "autocomplete": "email",
        "optional": false
      }
    },

    {
      "key": "veteran_attorney_or_vso",
      "type": "textarea",
      "templateOptions": {
        "label": "Name of attorney, agent, or veterans service organization",
        "rows": 2,
        "columns": 100,
        "optional": true
      }
    },

    {
      "key": "veteran_date_signed_0966",
      "type": "input",
      "optionsTypes": [
        "date"
      ],
      "templateOptions": {
        "label": "Date Signed",
        "placeholder": "MM/DD/YYYY",
        "optional": false
      }
    }
  ]
}

},{}],2:[function(require,module,exports){

var sections = ({"VBA-21-0966-ARE":require("../../conf/forms/VBA-21-0966-ARE.json")});

var app = angular.module('vetafiApp');

/**
 * Roll up all of the formly form templates into a single angular module.
 */
app.factory('formTemplateService', [function() {
  return sections;
}]);

},{"../../conf/forms/VBA-21-0966-ARE.json":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9jb25mL2Zvcm1zL1ZCQS0yMS0wOTY2LUFSRS5qc29uIiwic3JjL2Zvcm1seS1maWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInZmaVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIkludGVudCB0byBGaWxlXCIsXG4gICAgXCJzdW1tYXJ5XCI6IFwiVGhpcyBmb3JtIGlzIHVzZWQgdG8gbm90aWZ5IFZBIG9mIHlvdXIgaW50ZW50IHRvIGZpbGUgZm9yIGJlbmVmaXRzLiBFdmVuIGlmIHlvdXIgY2xhaW0gZmFpbHMgdG8gcHJvY2VzcywgeW91ciBiZW5lZml0cyBlZmZlY3RpdmUgZGF0ZSB3aWxsIHN0aWxsIGJlIHRoZSBkYXRlIHRoZSBWQSByZWNlaXZlcyB0aGlzIGZvcm0uXCIsXG4gICAgXCJyZXF1aXJlZFwiOiB0cnVlXG4gIH0sXG4gIFwibmFtZVwiOiBcIklOVEVOVCBUTyBGSUxFIEEgQ0xBSU0gRk9SIENPTVBFTlNBVElPTiBBTkQvT1IgUEVOU0lPTiwgT1IgU1VSVklWT1JTIFBFTlNJT04gQU5EL09SIERJQ1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiVGhpcyBGb3JtIElzIFVzZWQgdG8gTm90aWZ5IFZBIG9mIFlvdXIgSW50ZW50IHRvIEZpbGUgZm9yIEdlbmVyYWwgQmVuZWZpdHNcIixcbiAgXCJmaWVsZHNcIjogW1xuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiZmlsaW5nX2Zvcl9zZWxmXCIsXG4gICAgICBcInR5cGVcIjogXCJyYWRpb1wiLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiQXJlIHlvdSBmaWxpbmcgZm9yIHlvdXJzZWxmLCBvciBmb3Igc29tZW9uZSBlbHNlP1wiLFxuICAgICAgICBcIm9wdGlvbnNcIjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIkZvciBteXNlbGZcIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJuYW1lXCI6IFwiRm9yIHNvbWVvbmUgZWxzZVwiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwidmV0ZXJhbl9pbnRlbnRfdG9fZmlsZV9jb21wZW5zYXRpb25feV9uXCIsXG4gICAgICBcInR5cGVcIjogXCJyYWRpb1wiLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiRG8geW91IGludGVuZCB0byBmaWxlIGZvciBjb21wZW5zYXRpb24gcmVsYXRlZCBiZW5lZml0cz9cIixcbiAgICAgICAgXCJvcHRpb25zXCI6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIm5hbWVcIjogXCJZZXNcIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJZZXNcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJuYW1lXCI6IFwiTm9cIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJOb1wiXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBcIm9wdGlvbmFsXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcInZldGVyYW5faW50ZW50X3RvX2ZpbGVfcGVuc2lvbl95X25cIixcbiAgICAgIFwidHlwZVwiOiBcInJhZGlvXCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJEbyB5b3UgaW50ZW5kIHRvIGZpbGUgZm9yIHBlbnNpb24gcmVsYXRlZCBiZW5lZml0cz9cIixcbiAgICAgICAgXCJvcHRpb25zXCI6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIm5hbWVcIjogXCJZZXNcIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJZZXNcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJuYW1lXCI6IFwiTm9cIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJOb1wiXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBcIm9wdGlvbmFsXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImRlcGVuZGVuY3lfaW5kZW1uaXR5X2NvbXBlbnNhdGlvbl95X25cIixcbiAgICAgIFwidHlwZVwiOiBcInJhZGlvXCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJEbyB5b3UgaW50ZW5kIHRvIGZpbGUgZm9yIHN1cnZpdm9ycyBwZW5zaW9uIGFuZC9vciBkZXBlbmRlbmN5IGFuZCBpbmRlbW5pdHkgY29tcGVuc2F0aW9uP1wiLFxuICAgICAgICBcIm9wdGlvbnNcIjogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIlllc1wiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlllc1wiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIm5hbWVcIjogXCJOb1wiLFxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIk5vXCJcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiY2xhaW1hbnRfZmlyc3RfbmFtZVwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIllvdXIgRmlyc3QgTmFtZVwiLFxuICAgICAgICBcInBsYWNlaG9sZGVyXCI6IFwiSm9oblwiLFxuICAgICAgICBcImF1dG9jb21wbGV0ZVwiOiBcImdpdmVuLW5hbWVcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjbGFpbWFudF9taWRkbGVfaW5pdGlhbFwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIllvdXIgTWlkZGxlIEluaXRpYWxcIixcbiAgICAgICAgXCJwbGFjZWhvbGRlclwiOiBcIkNcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJhZGRpdGlvbmFsLW5hbWVcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjbGFpbWFudF9sYXN0X25hbWVcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJZb3VyIExhc3QgTmFtZVwiLFxuICAgICAgICBcInBsYWNlaG9sZGVyXCI6IFwiRG9lXCIsXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlXCI6IFwiZmFtaWx5LW5hbWVcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjbGFpbWFudF9zc25cIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJZb3VyIFNvY2lhbCBTZWN1cml0eSBOdW1iZXJcIixcbiAgICAgICAgXCJwbGFjZWhvbGRlclwiOiBcIjAwMC0wMC0wMDAwXCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH0sXG4gICAgICBcIm9wdGlvbnNUeXBlc1wiOiBbXG4gICAgICAgIFwic3NuXCJcbiAgICAgIF1cbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2ZpcnN0X25hbWVcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJWZXRlcmFuJ3MgRmlyc3QgTmFtZVwiLFxuICAgICAgICBcInBsYWNlaG9sZGVyXCI6IFwiSm9oblwiLFxuICAgICAgICBcImF1dG9jb21wbGV0ZVwiOiBcImdpdmVuLW5hbWVcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIFwiaGlkZUV4cHJlc3Npb25cIjogXCJtb2RlbC5maWxpbmdfZm9yX3NlbGZcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX21pZGRsZV9pbml0aWFsXCIsXG4gICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiVmV0ZXJhbidzIE1pZGRsZSBJbml0aWFsXCIsXG4gICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCJDXCIsXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlXCI6IFwiYWRkaXRpb25hbC1uYW1lXCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH0sXG4gICAgICBcImhpZGVFeHByZXNzaW9uXCI6IFwibW9kZWwuZmlsaW5nX2Zvcl9zZWxmXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwidmV0ZXJhbl9sYXN0X25hbWVcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJWZXRlcmFuJ3MgTGFzdCBOYW1lXCIsXG4gICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCJEb2VcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJmYW1pbHktbmFtZVwiLFxuICAgICAgICBcIm9wdGlvbmFsXCI6IGZhbHNlXG4gICAgICB9LFxuICAgICAgXCJoaWRlRXhwcmVzc2lvblwiOiBcIm1vZGVsLmZpbGluZ19mb3Jfc2VsZlwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcInZldGVyYW5fc3NuXCIsXG4gICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiVmV0ZXJhbidzIFNvY2lhbCBTZWN1cml0eSBOdW1iZXJcIixcbiAgICAgICAgXCJwbGFjZWhvbGRlclwiOiBcIjAwMC0wMC0wMDAwXCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH0sXG4gICAgICBcIm9wdGlvbnNUeXBlc1wiOiBbXG4gICAgICAgIFwic3NuXCJcbiAgICAgIF0sXG4gICAgICBcImhpZGVFeHByZXNzaW9uXCI6IFwibW9kZWwuZmlsaW5nX2Zvcl9zZWxmXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2RvYlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwib3B0aW9uc1R5cGVzXCI6IFtcbiAgICAgICAgXCJkYXRlXCJcbiAgICAgIF0sXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJWZXRlcmFuJ3MgRGF0ZSBvZiBCaXJ0aFwiLFxuICAgICAgICBcInBsYWNlaG9sZGVyXCI6IFwiTU0vREQvWVlZWVwiLFxuICAgICAgICBcImF1dG9jb21wbGV0ZVwiOiBcImJkYXlcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX3NleFwiLFxuICAgICAgXCJ0eXBlXCI6IFwicmFkaW9cIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIlZldGVyYW4ncyBHZW5kZXJcIixcbiAgICAgICAgXCJvcHRpb25zXCI6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIm5hbWVcIjogXCJNYWxlXCIsXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiTWFsZVwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIm5hbWVcIjogXCJGZW1hbGVcIixcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJGZW1hbGVcIlxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuc19zZXJ2aWNlX251bWJlclwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIlZldGVyYW4ncyBTZXJ2aWNlIE51bWJlciAoSWYgYXBwbGljYWJsZSlcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcImtleVwiOiBcInZldGVyYW5fcHJldmlvdXNfY2xhaW1fd2l0aF92YV95X25cIixcbiAgICAgIFwidHlwZVwiOiBcInJhZGlvXCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJIYXZlIHlvdSwgb3IgdGhlIHZldGVyYW4geW91IHJlcHJlc2VudCwgZXZlciBwcmV2aW91c2x5IGZpbGVkIGEgY2xhaW0gd2l0aCB0aGUgVkE/XCIsXG4gICAgICAgIFwib3B0aW9uc1wiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJuYW1lXCI6IFwiWWVzXCIsXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiWWVzXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIk5vXCIsXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiTm9cIlxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2YV9maWxlX251bWJlclwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIlZBIEZpbGUgTnVtYmVyXCIsXG4gICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCIwMDAwMDAwMDBcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIFwiaGlkZUV4cHJlc3Npb25cIjogXCJtb2RlbC52ZXRlcmFuX3ByZXZpb3VzX2NsYWltX3dpdGhfdmFfeV9uICE9ICdZZXMnXCJcbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2hvbWVfYWRkcmVzc19saW5lMVwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIkFkZHJlc3MgTGluZSAxXCIsXG4gICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCI1NSBNYWdub2xpYSBTdC5cIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJhZGRyZXNzLWxpbmUxXCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwidmV0ZXJhbl9ob21lX2FwYXJ0bWVudF9udW1iZXJcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJBcGFydG1lbnQgTnVtYmVyXCIsXG4gICAgICAgIFwicGxhY2Vob2xkZXJcIjogXCJBcHQuIDNcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJhZGRyZXNzLWxpbmUzXCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2hvbWVfY2l0eVwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIkNpdHlcIixcbiAgICAgICAgXCJwbGFjZWhvbGRlclwiOiBcIkthbnNhcyBDaXR5XCIsXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlXCI6IFwiYWRkcmVzcy1sZXZlbDJcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2hvbWVfc3RhdGVcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcIm9wdGlvbnNUeXBlc1wiOiBbXG4gICAgICAgIFwic3RhdGVcIlxuICAgICAgXSxcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIlN0YXRlXCIsXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlXCI6IFwiYWRkcmVzcy1sZXZlbDFcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2hvbWVfemlwX2NvZGVcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcIm9wdGlvbnNUeXBlc1wiOiBbXG4gICAgICAgIFwiemlwQ29kZVwiXG4gICAgICBdLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiUG9zdGFsIENvZGVcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJwb3N0YWwtY29kZVwiLFxuICAgICAgICBcIm9wdGlvbmFsXCI6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcInZldGVyYW5faG9tZV9jb3VudHJ5XCIsXG4gICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgXCJvcHRpb25zVHlwZXNcIjogW1xuICAgICAgICBcImNvdW50cnlcIlxuICAgICAgXSxcbiAgICAgIFwidGVtcGxhdGVPcHRpb25zXCI6IHtcbiAgICAgICAgXCJsYWJlbFwiOiBcIkNvdW50cnlcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJjb3VudHJ5XCIsXG4gICAgICAgIFwib3B0aW9uYWxcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjb250YWN0X3Bob25lX251bWJlclwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgIFwib3B0aW9uc1R5cGVzXCI6IFtcbiAgICAgICAgXCJwaG9uZU51bWJlclwiXG4gICAgICBdLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiQ29udGFjdCBQaG9uZSBOdW1iZXJcIixcbiAgICAgICAgXCJhdXRvY29tcGxldGVcIjogXCJ0ZWxcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjb250YWN0X2VtYWlsXCIsXG4gICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgXCJvcHRpb25zVHlwZXNcIjogW1xuICAgICAgICBcImVtYWlsXCJcbiAgICAgIF0sXG4gICAgICBcInRlbXBsYXRlT3B0aW9uc1wiOiB7XG4gICAgICAgIFwibGFiZWxcIjogXCJDb250YWN0IEVtYWlsXCIsXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlXCI6IFwiZW1haWxcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG5cbiAgICB7XG4gICAgICBcImtleVwiOiBcInZldGVyYW5fYXR0b3JuZXlfb3JfdnNvXCIsXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0YXJlYVwiLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiTmFtZSBvZiBhdHRvcm5leSwgYWdlbnQsIG9yIHZldGVyYW5zIHNlcnZpY2Ugb3JnYW5pemF0aW9uXCIsXG4gICAgICAgIFwicm93c1wiOiAyLFxuICAgICAgICBcImNvbHVtbnNcIjogMTAwLFxuICAgICAgICBcIm9wdGlvbmFsXCI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ2ZXRlcmFuX2RhdGVfc2lnbmVkXzA5NjZcIixcbiAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICBcIm9wdGlvbnNUeXBlc1wiOiBbXG4gICAgICAgIFwiZGF0ZVwiXG4gICAgICBdLFxuICAgICAgXCJ0ZW1wbGF0ZU9wdGlvbnNcIjoge1xuICAgICAgICBcImxhYmVsXCI6IFwiRGF0ZSBTaWduZWRcIixcbiAgICAgICAgXCJwbGFjZWhvbGRlclwiOiBcIk1NL0REL1lZWVlcIixcbiAgICAgICAgXCJvcHRpb25hbFwiOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgXVxufVxuIiwiXG52YXIgc2VjdGlvbnMgPSAoe1wiVkJBLTIxLTA5NjYtQVJFXCI6cmVxdWlyZShcIi4uLy4uL2NvbmYvZm9ybXMvVkJBLTIxLTA5NjYtQVJFLmpzb25cIil9KTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2ZXRhZmlBcHAnKTtcblxuLyoqXG4gKiBSb2xsIHVwIGFsbCBvZiB0aGUgZm9ybWx5IGZvcm0gdGVtcGxhdGVzIGludG8gYSBzaW5nbGUgYW5ndWxhciBtb2R1bGUuXG4gKi9cbmFwcC5mYWN0b3J5KCdmb3JtVGVtcGxhdGVTZXJ2aWNlJywgW2Z1bmN0aW9uKCkge1xuICByZXR1cm4gc2VjdGlvbnM7XG59XSk7XG4iXX0=
