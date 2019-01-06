// @format

const web3 = require('web3');

var Reentrance = artifacts.require('./Reentrance.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network, accounts) {
  deployer
    .deploy(Reentrance)
    .then(instance => {
      return instance.donate(accounts[0], {
        from: accounts[0],
        value: 1000000000000000000,
      });
      deployer.deploy(Exploit, instance.address);
    })
    .then(() => {
      return deployer.deploy(Exploit, Reentrance.address);
    });
};
