var Log;
function LogHelper(app) {
    this.app = app;
    Log = app.log;
}

module.exports = LogHelper;
module.exports.logConsole = function(msg) {
  Log.info(msg);
  console.log(msg);
};
