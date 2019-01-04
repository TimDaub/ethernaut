// @format

var Token = artifacts.require('./Token.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Token, 1000);
};
