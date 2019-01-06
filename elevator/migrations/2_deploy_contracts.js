// @format

const web3 = require('web3');

var Elevator = artifacts.require('./Elevator.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Elevator).then(instance => {
    return deployer.deploy(Exploit, instance.address);
  });
};
