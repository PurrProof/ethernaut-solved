# Ethernaut game solutions with Hardhat/Typescript/Mocha.js/Ethers

## Quickstart

```shell
git clone https://github.com/PurrProof/ethernaut-solved.git
cd ethernaut-solved
git submodule update --init
cp .env.example .env
pnpm it
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

### 9. King. [Level](https://ethernaut.openzeppelin.com/level/9), solution: [contract](contracts/MyKingAttack.sol), [test](test/09-king.ts)

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

### Other levels on the way...
