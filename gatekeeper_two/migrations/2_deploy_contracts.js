// @format
var GatekeeperTwo = artifacts.require('./GatekeeperTwo.sol');
var Exploit = artifacts.require('./Exploit.sol');

let gatekeeperTwo;

module.exports = function(deployer, network, accounts) {
  deployer
    .deploy(GatekeeperTwo)
    .then(instance => {
      gatekeeperTwo = instance;
      return gatekeeperTwo.entrant.call({from: accounts[0]});
    })
    .then(entrant => {
      console.log('Entrant:', entrant);
      console.log('Pwning contract with Exploit contract');
      return deployer.deploy(Exploit, gatekeeperTwo.address);
    })
    .then(() => {
      return gatekeeperTwo.entrant.call({from: accounts[0]});
    })
    .then(entrant => {
      console.log('Entrant:', entrant);
      return;
    });
};
