# Ethernaut game solutions with Hardhat/Typescript/Mocha.js/Ethers

## Quickstart

```shell
git clone https://github.com/PurrProof/ethernaut-solved.git
cd ethernaut-solved
git submodule update --init
pnpm i
pnpm test
```

## Solutions

### Fallback

- call levelInstance().contribute({value:1})
- transfer to contract 1 wei, it will trigger receive() function, which will transfer ownership to sender
- call levelInstance().withdraw() to withdraw all funds
