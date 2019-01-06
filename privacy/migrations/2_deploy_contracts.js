// @format

const ethJsUtil = require('ethereumjs-util');
const Web3 = require('web3');

var Privacy = artifacts.require('./Privacy.sol');
var PrivacyFactory = artifacts.require('./PrivacyFactory.sol');
var Exploit = artifacts.require('./Exploit.sol');

module.exports = function(deployer, network, accounts) {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  let privacyInstance;

  deployer
    .deploy(PrivacyFactory)
    .then(instance => {
      // Due to the internal call from PrivacyFactory to Privacy we need to
      // dry-call createInstance first before we create the Privacy instance.
      privacyInstance = instance;
      return instance.createInstance.call(accounts[0], {from: accounts[0]});
    })
    .then(privacyAddress => {
      console.log('Privacy:', privacyAddress);
      return privacyInstance.createInstance(accounts[0]);
    });
};
