var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialUserSchema = new Schema({
  type: String,
  oauthToken: String,
  state: Number,
  stateUpdatedAt: Date  // Date of last state modification
}, {
  timestamp: true
});

var State = {
  ACTIVE: 0,
  INACTIVE: 1
};

var SocialUser = mongoose.model('SocialUser', socialUserSchema);
module.exports = SocialUser;
module.exports.State = State;
