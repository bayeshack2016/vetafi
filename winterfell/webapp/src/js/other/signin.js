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

$(document).ready(function(){
  $('.vfi-signup-view .vfi-submit-btn').click(function() {
    var email = $('.vfi-input-email').val();
    var password = $('.vfi-input-password').val();

    var url = "http://localhost:3999/auth/signup";
    var data = {};
    var success = function(resp) {
      debugger;
      if (resp.redirect) {
        window.location.replace(resp.redirect);
      }
    };
    var error = function(resp) {
      debugger;
    };
    postRequest(url, data, success, error);
  });


  $('.vfi-login-view .vfi-submit-btn').click(function() {
    var email = $('.vfi-input-email').val();
    var password = $('.vfi-input-password').val();
    var url = "http://localhost:3999/auth/login";
    var data = {"email": email, "password": password};
    var success = function(resp) {
      debugger;
      if (resp.userId) {
        sessionStorageHelper.setPair(vfiConstants.keyUserId, resp.userId);
      }
      if (resp.redirect) {
        window.location.replace(resp.redirect);
      }
    };
    var error = function(resp) {
      debugger;
    };
    postRequest(url, data, success, error);
  });

});
