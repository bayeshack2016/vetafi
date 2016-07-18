function postRequest(url, data, successFunc, failFunc) {
  $.ajax({
    url: url,
    method: "POST",
    data: data,
    dataType: 'json',
    success: successFunc,
    error: failFunc
  });
}

function checkValidEmail(email) {
  return email.indexOf('@') > -1;
}

function validateInputs(email, password, confirmPassword) {
  if (!checkValidEmail(email)) {
    displayError("Invalid email");
    return false;
  }

  if (password.length < 6) {
    displayError("Password is too short");
    return false;
  }

  if (confirmPassword && confirmPassword != password) {
    displayError("Passwords do not match");
    return false;
  }

  return true;
}

function displayError(msg) {
  $('.vfi-error-msg').text(msg);
}

$(document).ready(function(){
  $('.vfi-signup-view .vfi-submit-btn').click(function(e) {
    e.preventDefault();
    var email = $('.vfi-input-email').val();
    var password = $('.vfi-input-password.vfi-first-pwd').val();
    var confirmPwd = $('.vfi-input-password.vfi-confirm').val();

    // Check inputs & display error if there is one.
    if (!validateInputs(email, password, confirmPwd)) {
      return false;
    }

    var url = "http://localhost:3999/auth/signup";
    var data = {
      email: email,
      password: password
    };
    var success = function(resp) {
      debugger;
      if (resp.userId) {
        sessionStorageHelper.setPair(vfiConstants.keyUserId, resp.userId);
      }
      if (resp.redirect) {
        window.location.href = resp.redirect;
      }
    };
    var error = function(resp) {
      console.log('Error: ' + JSON.stringify(resp));
      debugger;
      if (resp.responseJSON.error == "email_exists") {
        displayError("This email already being used. Try logging in with this email or try another email.");
      } else {
        displayError("Unknown server issues. Please try again later.");
      }
    };
    postRequest(url, data, success, error);
  });


  $('.vfi-login-view .vfi-submit-btn').click(function(e) {
    debugger;
    e.preventDefault();
    var email = $('.vfi-input-email').val();
    var password = $('.vfi-input-password').val();

    // Check inputs & display error if there is one.
    if (!validateInputs(email, password)) {
      return;
    }

    var url = "http://localhost:3999/auth/login";
    var data = {"email": email, "password": password};
    var success = function(resp) {
      if (resp.userId) {
        sessionStorageHelper.setPair(vfiConstants.keyUserId, resp.userId);
      }
      if (resp.redirect) {
        window.location.href = resp.redirect;
      }
    };
    var error = function(resp) {
      console.log('Error: ' + JSON.stringify(resp));
      displayError('Email and password do not match our records.');
    };
    postRequest(url, data, success, error);
  });

});
