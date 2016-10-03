var execSync = require('child_process').execSync;
var BISCUIT_BIN='biscuit';

function Biscuit (app) {
    this.secretsYamlFile = app.get('secretsFile');
}

Biscuit.prototype.get = function(secret) {
    var command = BISCUIT_BIN + ' get -f ' + this.secretsYamlFile + ' \'' + secret + '\'';
    return execSync(command, {encoding: 'utf8'});
};

module.exports = Biscuit;
