```
# Start ganache-cli and give every account 10000 ether
$ ganache-cli --networkId 15 --gasLimit=50000000 -h=0.0.0.0 -p 8545 -m candy maple cake sugar pudding cream honey rich smooth crumble sweet treat --blockTime 1 -e 10000
$ truffle migrate
# Run pwn script to expl0it the contract
$ node pwn.js
```
