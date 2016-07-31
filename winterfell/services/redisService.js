var redis = require('redis');

var redisClient = redis.createClient();

function RedisService (app) {
    this.app = app;
}

module.exports = RedisService;
module.exports.getClient = function() {
  return redisClient;
};
