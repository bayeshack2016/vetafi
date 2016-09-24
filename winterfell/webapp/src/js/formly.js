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
        phoneNumber: function (viewValue, modelValue) {
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
        ssn: function (viewValue, modelValue) {
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
        zipCode: function (viewValue, modelValue) {
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
        state: function (viewValue, modelValue) {
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
        zipCode: function (viewValue, modelValue) {
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
        zipCode: function (viewValue, modelValue) {
          if (!viewValue) {
            return true;
          }
          return /.+@.+\..+/.test(viewValue);
        }
      }
    }
  });
}]);
