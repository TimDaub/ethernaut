// @format

var Force = artifacts.require('./Force.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Force).then(() => {
    return deployer.deploy(Exploit, Force.address);
  });
};
