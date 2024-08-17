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

### 5. Token. WIP (needs to be documented).

### 6. Delegation. WIP (needs to be documented).

### 7. Force. [Level](https://ethernaut.openzeppelin.com/level/7), solution: [contract](contracts/MyTelephoneAttack.sol), [test](test/04-telephone.ts)

- the EVM doesn't prevent self destructing contract from sending funds to either EOA or to SCA

### 8. Vault. WIP (needs to be documented).

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

Attack vector:

- the "partner" contract spend all available to it gas (63/64 of total in parent call) in infinite cycle
- the rest 1/64 gas is not enough to make .transfer()

How to avoid:

- limit gas for external calls, like .call{gas:N}("")
- follow Check-Effects-Iteration pattern

### Other levels on the way...
