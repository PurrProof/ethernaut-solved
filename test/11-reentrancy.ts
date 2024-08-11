import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Reentrance, ReentranceFactory, ReentranceFactory__factory, Reentrance__factory } from "../typechain-types";
import { MyReentrancyAttack, MyReentrancyAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("11. Reentrance level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<ReentranceFactory, Reentrance>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, ReentranceFactory__factory, (address, signer) =>
      Reentrance__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const donation = 5n;

    // deploy attacker contract
    const attackerFactory: MyReentrancyAttack__factory = new MyReentrancyAttack__factory(context.player);
    const attacker: MyReentrancyAttack = await attackerFactory.deploy();
    await attacker.waitForDeployment();

    const levelBalance = await hre.ethers.provider.getBalance(level.instance);

    // make bad things
    const tx = await attacker.connect(context.player).attack(level.instance, { value: donation });
    await expect(tx).to.be.not.reverted;
    const rcpt = await tx.wait();
    if (!rcpt) {
      expect.fail("Withdraw tx receipt is empty.");
    }

    // target's balance should be zero
    expect(await hre.ethers.provider.getBalance(level.instance)).to.be.eq(0);

    // attacker balance should be increased successfully
    expect(await hre.ethers.provider.getBalance(attacker)).to.be.eq(levelBalance + donation);

    // check level is completed
    await completeLevel(context, level);
  });
});
