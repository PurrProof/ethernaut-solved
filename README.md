# Ethernaut game solutions with Hardhat/Typescript/Mocha.js/Ethers

## Quickstart

```shell
git clone https://github.com/PurrProof/ethernaut-solved.git
cd ethernaut-solved
git submodule update --init
cp .env.example .env
pnpm it
```

## Useful snippets

```
const prov = new _ethers.providers.Web3Provider(window.ethereum);
await prov.getStorageAt(await contract.address,2)
sol2uml storage -d -u $RPC_NODE_URL -c Privacy -s $PRIVACY_INSTANCE_ADDRESS -o storage.svg ./Privacy.sol
cast send -i -r $RPC_NODE_URL --create $BYTECODE
cast call -i -r $RPC_NODE_URL $ADDRESS $FUNCTION_ID
```

## Solutions

### 0. Instance. [Level](https://ethernaut.openzeppelin.com/level/0), solution: [test](test/00-instance.ts)

- perform list of view/pure functions calls
- submit read password to authenticate() function

### 1. Fallback. [Level](https://ethernaut.openzeppelin.com/level/1), solution: [test](test/01-fallback.ts)

- call levelInstance().contribute({value:1})
- transfer to contract 1 wei, it will trigger receive() function, which will transfer ownership to sender
- call levelInstance().withdraw() to withdraw all funds

### 2. Fallout. [Level](https://ethernaut.openzeppelin.com/level/2), solution: [test](test/02-fallout.ts)

- to claim ownership, just call instance.Fallout() function (which is not a contstructor)

### 3. CoinFlip. [Level](https://ethernaut.openzeppelin.com/level/3), solution: [contract](contracts/MyCoinFlipAttack.sol), [test](test/03-coinflip.ts)

- repeat coin flip logic in the attacker contract
- make 10 guesses, one per block

### 4. Telephone. [Level](https://ethernaut.openzeppelin.com/level/4), solution: [contract](contracts/MyTelephoneAttack.sol), [test](test/04-telephone.ts)

- tx.origin != msg.sender: call target contract through proxxy (attacker) contract

### 5. Token. [Level](https://ethernaut.openzeppelin.com/level/5), solution: [test](test/05-token.ts)

**Attack vector**

- underflow in the transfer() function

**How to avoid**

- use solidity 0.8.0+, there is a checked arithmetics by default
- use libraries like the SafeMath for the older solidity versions

### 6. Delegation. [Level](https://ethernaut.openzeppelin.com/level/6), solution: [test](test/06-delegation.ts)

**Attack vector**

Send `payload=Delegate.pwn.selector` to the `Delegation` contract. The call triggers the `fallback()` function, which
delegates execution to the `Delegate` contract, where the owner storage variable is changed to `msg.sender`. Since the
call is executed in the context of `Delegation`, its `owner` storage variable, located in the 0th slot, is the one that
gets changed.

**How to avoid**

Secure the `fallback` function with access control or avoid using `delegatecall` in it. Explicitly define functions to
prevent unauthorized state changes.

### 7. Force. [Level](https://ethernaut.openzeppelin.com/level/7), solution: [contract](contracts/MyTelephoneAttack.sol), [test](test/04-telephone.ts)

- the EVM doesn't prevent self destructing contract from sending funds to either EOA or to SCA

### 8. Vault. [Level](https://ethernaut.openzeppelin.com/level/8), solution: [test](test/08-vault.ts)

- read password from contract storage (1st slot)

### 9. King. [Level](https://ethernaut.openzeppelin.com/level/9), solution: [contract](contracts/MyForceAttack.sol), [test](test/07-force.ts)

- attacker contract should have no payable receive/fallback functions
- send prize + 1 value from attacker contract to target contract

### 10. Reentrance. [Level](https://ethernaut.openzeppelin.com/level/10), solution: [contract](contracts/MyReentrancyAttack.sol), [test](test/10-reentrancy.ts)

- in single tx: donate amount, withdraw amount, re-enter target in receive() and withdraw(1), causing underflow of
  attacker balance in mapping
- deplete target balance in same(or another) tx by calling target.withdraw(target.balance)

### 11. Elevator. [Level](https://ethernaut.openzeppelin.com/level/11), solution: [contract](contracts/MyElevatorAttack.sol), [test](test/11-elevator.ts)

- key is to make Bulding.isLastFloor(...) function which gives different results depends on input data and target's
  state

### 12. Privacy. [Level](https://ethernaut.openzeppelin.com/level/12), solution: [test](test/12-privacy.ts)

- code is in the last array item, which is situated at the slot #5. Read this slot contents, take upper 16 bytes, that's
  the password
- call `instance.unlock(password)`
- to vizualize level storage, install `sol2uml`, then run
  `sol2uml storage -d -u $RPC_NODE_URL -c Privacy -s $PRIVACY_INSTANCE_ADDRESS -o storage.svg ./Privacy.sol`

### 13. GateKeeperOne. [Level](https://ethernaut.openzeppelin.com/level/13), solution: [contract](contracts/MyGateKeeper1Attack.sol), [test](test/13-gatekeeper1.ts)

- gasleft() may change because of compiler version and settings, so bruteforce
- for code, use 2 lower bytes of tx/origin, and upper 32 bits should not be zero

### 14. GateKeeperTwo. [Level](https://ethernaut.openzeppelin.com/level/14), solution: [contract](contracts/MyGateKeeper2Attack.sol), [test](test/14-gatekeeper2.ts)

- victim.enter(...) function should be called in attacker constructor; this way victim.extcodesize(attacker) will be
  still zero
- the idea behind \_gateKey construction is that val XOR (NOT val) => all bits set

### 15. Naught Coin. [Level](https://ethernaut.openzeppelin.com/level/15), solution: [test](test/15-naughtcoin.ts)

- it's just as simple as `token.connect(player).approve(other, totalAmount)`, then
  `token.connect(other).transferFrom(player, other. totalAmount)`

### 16. Preservation. [Level](https://ethernaut.openzeppelin.com/level/16), solution: [contract](contracts/MyPreservationAttack.sol), [test](test/16-preservation.ts)

- call second library, it will overwrite 0th slot in storage with address of fake library
- call first library, faked by us: it will overwrite slots 0-2 in storage, where slot #2 contains owner address

### 17. Recovery. [Level](https://ethernaut.openzeppelin.com/level/17), solution: [test](test/17-recovery.ts)

- contract addresses are deterministic: `new address = keccak256(creatorAddress, nonce)`, where nonce starts from 0 for
  EOAs, and from 1 for SCAs, in latter case nonce means number of spawned contracts

### 18. Magic Number. [Level](https://ethernaut.openzeppelin.com/level/18), solution: [1 raw bytecode](test/18-magicnumber.ts), [2 assembly](contracts/MyMagicNumAttack.sol)

```asm
// init code
PUSH1 0x0a  // sizecopy, 10 bytes (decimal) is size of runtime code
PUSH1 0x0c  // offset, 13 bytes (decimal) is size of init code
PUSH1 0x00  // destOffset, target offset in memory
CODECOPY    // destOffset, offset, sizecopy => runtime bytecode into memory
PUSH1 0x0a  // size, 10 bytes (decimal) is size of runtime code
PUSH1 0x00  // offset
RETURN      // offset, size => halt execution, return data from memory

// run time code
PUSH1 0x2a  // value, 42 decimal
PUSH1 0x00  // offset
MSTORE      // offset, value => save word (32 bytes) to memory
PUSH1 0x20  // size
PUSH1 0x00  // offset
RETURN      // offset, size => halt execution, return data (32 bytes here) from memory
```

Proposed level description improvement: [pull-request](https://github.com/OpenZeppelin/ethernaut/pull/750)

### 19. Alien Codex. [Level](https://ethernaut.openzeppelin.com/level/19), solution: [contract](contracts/MyAlienCodexAttack.sol)

- investigate storage structure, using contract ABI and getStorage() function
- optionally, using contract.record(\_content), check that codex[] takes slot#1, it should store array length
- see
  [0.6.0 breaking changes](https://docs.soliditylang.org/en/v0.8.26/060-breaking-changes.html#explicitness-requirements),
  `Member-access to length of arrays is now always read-only, even for storage arrays. It is no longer possible to resize storage arrays by assigning a new value to their length.`
- underflow array length by calling retract()
- calculate shift to address slot #0, it equals to type(uint256).max - keccak256(1) + 1, where keccak256(1) is address
  of slot, containing 0th array element
- fill the slot #0 with new owner address with help of revise(i, owner)

### 20. Denial. [Level](https://ethernaut.openzeppelin.com/level/20), solution: [contract](contracts/MyDenialAttack.sol), [test](test/20-denial.ts)

**Attack vector**

- the "partner" contract spend all available to it gas (63/64 of total in parent call) in infinite cycle
- the rest 1/64 gas is not enough to make .transfer()

**How to avoid**

- limit gas for external calls, like .call{gas:N}("")
- follow Check-Effects-Iteration pattern

### 21. Shop. [Level](https://ethernaut.openzeppelin.com/level/21), solution: [contract](contracts/MyShopAttack.sol), [test](test/21-shop.ts)

**Attack vector**

- attacker contract fake its responses depending on target contract state

**How to avoid**

- don't trust external/untrusted contracts output

### 21. Dex. [Level](https://ethernaut.openzeppelin.com/level/22), solution: [test](test/22-dex.ts)

Current DEX works this way:

| User action     | DexT1 | DexT2 | UserT1 | UserT2 |
| --------------- | ----- | ----- | ------ | ------ |
| **Initial**     | 100   | 10    | 10     | 10     |
| **10 T1 -> T2** | 110   | 90    | 0      | 20     |
| **20 T2 -> T1** | 86    | 110   | 24     | 0      |
| **24 T1 -> T2** | 110   | 80    | 0      | 30     |
| **30 T2 -> T1** | 69    | 110   | 41     | 0      |
| **41 T1 -> T2** | 110   | 45    | 0      | 65     |
| **45 T2 -> T1** | 0     | 90    | 110    | 20     |

I'd rather use
[constant product formula](https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works)

### 23. Dex Two. [Level](https://ethernaut.openzeppelin.com/level/23), solution: [contract](contracts/MyDex2Attack.sol), [test](test/23-dex2.ts)

**Attack vector**

- attacker swaps self-managed tokens for tokens, registered in the dex

**How to avoid**

- don't allow to swap not registered / not trusted tokens

P.S. I made _too honest_ fake tokens ;) The original solution is more brutal — their fake tokens only have the
**balanceOf** and **transferFrom** functions, which return just the necessary minimum.

### 24. Puzzle Wallet. [Level](https://ethernaut.openzeppelin.com/level/24), solution: [contract](contracts/MyPuzzleWalletAttack.sol), [test](test/24-puzzlewallet.ts)

1. **Attack Vector**

   - **Storage Collision Exploit**  
     Exploits a storage collision between the proxy's `pendingAdmin` and the implementation's `owner` to gain control.
   - **Recursive Multicall Exploit**  
     Uses `multicall` with a reentrant-like call to drain funds by calling `deposit` twice in one transaction.
   - **Admin Privilege Hijack**  
     Overwrites the proxy's `admin` by setting the `maxBalance`, due to storage collision, to take control.

2. **How to Avoid**
   - **Proper Storage Layout**  
     Use reserved storage slots to avoid collisions between proxy and implementation contracts.
   - **Secure Delegatecalls**  
     Only delegatecall to trusted and verified implementations with compatible storage.
   - **Restrict Function Combinations**  
     Limit `multicall` or prevent repeated calls to functions like `deposit` within the same transaction.

### 25. Motorbike. [Level](https://ethernaut.openzeppelin.com/level/25), solution: [contract](contracts/MyMotorbikeAttack.sol), [test](test/25-motorbike.ts)

**Attack vector**

- Take upgrader role of implementation contract (Engine). It's possible because initialize() function is not disabled
  and opened to everyone.
- Change Engine's implementation to attacker contract, then call attacker's method, which contains selfdestruct()

**How to avoid**

- disable initializer in Engine contract

P.S. [discussion](https://github.com/OpenZeppelin/ethernaut/issues/701)

### 26. Double Entry Point. [Level](https://ethernaut.openzeppelin.com/level/26), solution: [detection bot](contracts/MyDoubleEntryDetectionBot.sol), [test](test/26-doubleentry.ts)

### 27. Good Samaritan. [Level](https://ethernaut.openzeppelin.com/level/27), solution: [contract](contracts/MyGoodSamaritanAttack.sol), [test](test/27-goodsamaritan.ts)

**Attack vector**

- revert with NotEnoughBalance() error in the attacker's contract notify() function
- error will be bubbled up to GoodSamaritan contract, where rest of balance will be transfered to attacker contract
- don't revert, if transfer exceeds 10 coins

**How to avoid**

- assume, that errors may be bubbled up by any contract down in the chain

### 28. Gate Keeper Three. [Level](https://ethernaut.openzeppelin.com/level/28), solution: [contract](contracts/MyGateKeeperThreeAttack.sol), [test](test/28-gatekeeper3.ts)

**Attack vector**

- use block.timestamp as password; it's same for all internal transactions within transaction

### 29. Switch. [Level](https://ethernaut.openzeppelin.com/level/29), solution: [contract](contracts/MySwitchAttack.sol), [test](test/29-switch.ts)

**Attack vector**

Manually created calldata with non-standard variable offset.

```text
Normal Call: Switch.flipSwitch(abi.encodeWithSignature("turnSwitchOn()"))
Calldata:
    0x30c13ade: selector of flipSwitch(bytes)
    0x0000000000000000000000000000000000000000000000000000000000000020: offset to the `bytes` parameter area
    0x0000000000000000000000000000000000000000000000000000000000000004: length of the `bytes` parameter, 4 in this case
    0x76227e1200000000000000000000000000000000000000000000000000000000: data itself, right-padded
That's why offset 68 is hardcoded in the expression `calldatacopy(selector, 68, 4) // grab function selector from calldata`
I.e. 4 (selector) + 32 (offset) + 32 (length) = 68

So we need to have selector of the allowed function, i.e. Switch.turnSwitchOff.selector, at the offset 68
We'll construct calldata manually:
    0x30c13ade: selector of flipSwitch(bytes)
    0x0000000000000000000000000000000000000000000000000000000000000060: offset to the `bytes` parameter area
    0x0000000000000000000000000000000000000000000000000000000000000000: not used word, it can be anything
    0x20606e1500000000000000000000000000000000000000000000000000000000: hardcoded Switch.turnSwitchOff.selector
    0x0000000000000000000000000000000000000000000000000000000000000004: length of flipSwitch's bytes memory _data parameter
    0x76227e12: data itself, Switch.turnSwitchOn.selector
```

**How to avoid**

- don't hardcode variable offsets when dealing with calldata at low level

### 30. Higher Order. [Level](https://ethernaut.openzeppelin.com/level/30), solution: [contract](contracts/MyHigherOrderAttack.sol), [test](test/30)

https://docs.soliditylang.org/en/latest/security-considerations.html#minor-details

> Types that do not occupy the full 32 bytes might contain “dirty higher order bits”. This is especially important if
> you access msg.data - it poses a malleability risk: You can craft transactions that call a function f(uint8 x) with a
> raw byte argument of 0xff000001 and with 0x00000001. Both are fed to the contract and both will look like the number 1
> as far as x is concerned, but msg.data will be different, so if you use keccak256(msg.data) for anything, you will get
> different results.

https://github.com/ethereum/solidity/issues/14766 (closed)

> This no longer seems to be true in Solidity >= 0.8. ABI decoding now reverts when it encounters dirty high-order bits.
> Can you please confirm this is no longer an issue and add a comment to the documentation (or remove this section), or
> clarify why this is still an issue in Solidity >= 0.8?

### Other levels on the way...
