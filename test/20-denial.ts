import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Denial, DenialFactory, DenialFactory__factory, Denial__factory } from "../typechain-types";
import { MyDenialAttack, MyDenialAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("20. Denial", function () {
  let context: FixtureContext;
  let level: FixtureLevel<DenialFactory, Denial>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, DenialFactory__factory, (address, signer) =>
      Denial__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyDenialAttack__factory = new MyDenialAttack__factory(context.player);
    const attackContract: MyDenialAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    const tx = await level.instance.setWithdrawPartner(attackContract);
    await tx.wait();

    // somebody (owner?) tries to withdraw
    await expect(level.instance.withdraw({ gasLimit: 1_000_000 })).to.be.reverted;

    await completeLevel(context, level);
  });
});
