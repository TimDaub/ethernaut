// @format

var Fallback = artifacts.require('./Fallback.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Fallback);
};
