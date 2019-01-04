// @format

var Fallout = artifacts.require('./Fallout.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Fallout);
};
