module.exports = {

  getCsrf: function (res) {
    return unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
  }
};
