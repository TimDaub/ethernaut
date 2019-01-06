// @format

const web3 = require('web3');

var King = artifacts.require('./King.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network, accounts) {
  deployer
    .deploy(King, {from: accounts[0], value: 1000000000000000000})
    .then(() => {
      return deployer.deploy(Exploit, King.address);
    });
};
