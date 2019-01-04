// @format

var CoinFlip = artifacts.require('./CoinFlip.sol');

module.exports = function(deployer, network) {
  deployer.deploy(CoinFlip);
};
