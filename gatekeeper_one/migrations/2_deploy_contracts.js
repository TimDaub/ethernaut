// @format
var GatekeeperOne = artifacts.require('./GatekeeperOne.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(GatekeeperOne).then(instance => {
    return deployer.deploy(Exploit, instance.address);
  });
};
