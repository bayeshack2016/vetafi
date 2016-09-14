function SocialUser(app) {
    this.app = app;
}

module.exports = SocialUser;
module.exports.State = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};
module.exports.Type = {
  UNKNOWN: "unknown",
  ID_ME: "id_me",
  FACEBOOK: "facebook"
};
