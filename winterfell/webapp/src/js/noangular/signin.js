function checkValidEmail(email) {
  var idxAt = email.indexOf('@');
  var dotAt = email.indexOf('.');
  return idxAt > -1 && dotAt > idxAt;
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

  if (confirmPassword != undefined && confirmPassword != password) {
    displayError("Passwords do not match");
    return false;
  }

  return true;
}

function validateForm() {
  var email = $('input.email').val();
  var password = $('input.pwd').val();
  var confirmPwd = $('input.confirm-pwd').val();

  return validateInputs(email, password, confirmPwd);
}

function displayError(msg) {
  $('.error-msg').text(msg);
}

function revealEmailLogin() {
  $('.options').addClass('vfi-hide');
  $('.inputs').addClass('vfi-show');
}

function onBackButton() {
  $('.options').removeClass('vfi-hide');
  $('.inputs').removeClass('vfi-show');
}
