// @format
var Locked = artifacts.require('./Locked.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Locked).then(instance => {
    return deployer.deploy(Exploit, instance.address);
  });
};
