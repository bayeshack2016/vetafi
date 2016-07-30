var exec = require('child_process').exec;
var BISCUIT_BIN='biscuit';

function Biscuit (secretsYamlFile) {
    this.secretsYamlFile = secretsYamlFile;
}

Biscuit.prototype.get = function(secret, callback) {
    var command = BISCUIT_BIN + ' get -f ' + this.secretsYamlFile + ' \'' + secret + '\'';
    exec(command,
        function(err, stdout, stderr) {
            callback(err, stdout);
        });
};

module.exports = function(secretsYamlFile) {
    return new Biscuit(secretsYamlFile);
};