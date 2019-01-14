// @format
var Preservation = artifacts.require('./Preservation.sol');
var PreservationFactory = artifacts.require('./PreservationFactory.sol');
var Exploit = artifacts.require('./Exploit.sol');

let preservationFactoryInstance;
let preservationAddress;

module.exports = function(deployer, network, accounts) {
  deployer
    .deploy(PreservationFactory)
    .then(instance => {
      preservationFactoryInstance = instance;
      return instance.createInstance.call(accounts[0], {from: accounts[0]});
    })
    .then(preservation => {
      preservationAddress = preservation;
      console.log('Preservation:', preservation);
      return preservationFactoryInstance.createInstance(accounts[0]);
    })
    .then(() => {
      return deployer.deploy(Exploit, preservationAddress);
    });
};
