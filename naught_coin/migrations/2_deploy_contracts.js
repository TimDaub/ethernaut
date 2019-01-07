// @format
var NaughtCoin = artifacts.require('./NaughtCoin.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(NaughtCoin, accounts[0]);
};
