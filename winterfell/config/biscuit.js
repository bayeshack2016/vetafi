/**
 * Location of secrets.yaml file for different environments
 */
var environment = require('../utils/constants').environment;

var yamlFileLocations = {};

yamlFileLocations[environment.TEST] = '/vagrant/config/biscuit/test_secrets.yaml';
yamlFileLocations[environment.LOCAL] = '/vagrant/config/biscuit/secrets.yaml';
yamlFileLocations[environment.PROD] = '../config/biscuit/secrets.yaml';

module.exports = yamlFileLocations;
