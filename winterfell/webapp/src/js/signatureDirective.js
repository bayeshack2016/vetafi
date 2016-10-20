/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('signature', []);

angular.module('signature').directive('signaturePad', ['$window', '$timeout',
  function ($window, $timeout) {
    'use strict';

    var signaturePad, canvas, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="signature"><canvas ng-mouseup="updateModel()"></canvas></div>',
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
        scope.signaturePad = new SignaturePad(canvas);

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
