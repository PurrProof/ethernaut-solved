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

### 0. Instance

- perform list of view/pure functions calls
- submit read password to authenticate() function

### 1. Fallback. [Level](https://ethernaut.openzeppelin.com/level/1)

- call levelInstance().contribute({value:1})
- transfer to contract 1 wei, it will trigger receive() function, which will transfer ownership to sender
- call levelInstance().withdraw() to withdraw all funds

### 9. King. [Level](https://ethernaut.openzeppelin.com/level/9), [solution](contracts/MyKingAttack.sol)

- attacker contract should have no payable receive/fallback functions
- send prize + 1 value from attacker contract to target contract

### 10. Reentrance. [Level](https://ethernaut.openzeppelin.com/level/10), [solution](contracts/MyReentrancyAttack.sol)

- in single tx: donate amount, withdraw amount, re-enter target in receive() and withdraw(1), causing underflow of
  attacker balance in mapping
- deplete target balance in same(or another) tx by calling target.withdraw(target.balance)

### 11. Elevator. [Level](https://ethernaut.openzeppelin.com/level/11), [solution](contracts/MyElevatorAttack.sol).

- key is to make Bulding.isLastFloor(...) function which gives different results depends on input data and target's
  state
