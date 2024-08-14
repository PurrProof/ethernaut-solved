import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { NaughtCoin, NaughtCoinFactory, NaughtCoinFactory__factory, NaughtCoin__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("15. Naught Coin", function () {
  let context: FixtureContext;
  let level: FixtureLevel<NaughtCoinFactory, NaughtCoin>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, NaughtCoinFactory__factory, (address, signer) =>
      NaughtCoin__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // get initial player's token amount
    const amount = await level.instance.balanceOf(context.player);

    // approve other address to spend whole player's balance
    const approve = await level.instance.approve(context.owner, amount);
    await expect(approve).to.be.not.reverted;
    await approve.wait();

    // transfer player's balance
    const transferFrom = await level.instance
      .connect(context.owner)
      .transferFrom(context.player, context.owner, amount);
    await expect(transferFrom).to.be.not.reverted;
    await transferFrom.wait();

    // check balances
    expect(await level.instance.balanceOf(context.owner)).to.be.eq(amount);
    expect(await level.instance.balanceOf(context.player)).to.be.eq(0);

    await completeLevel(context, level);
  });
});
