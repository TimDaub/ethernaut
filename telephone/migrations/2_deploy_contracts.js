// @format

var Telephone = artifacts.require('./Telephone.sol');
var TelephoneAttack = artifacts.require('./TelephoneAttack.sol');

module.exports = function(deployer, network) {
  deployer.deploy(Telephone).then(() => {
    return deployer.deploy(TelephoneAttack, Telephone.address);
  });
};
