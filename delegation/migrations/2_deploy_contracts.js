// @format

var Delegate = artifacts.require('./Delegate.sol');
var Delegation = artifacts.require('./Delegation.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Delegate, accounts[0]).then(() => {
    return deployer.deploy(Delegation, Delegate.address);
  });
};
