// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function raiseAlert(address user) external;
}

contract MyDoubleEntryDetectionBot is IDetectionBot {
    address private _vault;

    constructor(address vault) {
        _vault = vault;
    }

    function handleTransaction(address user, bytes calldata msgData) external override {
        user;
        // treat msgData this way:
        // function signature: 4 bytes
        // address to: 32 bytes
        // uint256 value: 32 bytes
        // address origSender: 32 bytes
        (, , address origSender) = abi.decode(msgData[4:], (address, uint256, address));
        if (origSender == _vault) {
            IForta(msg.sender).raiseAlert(user);
        }
    }
}
