import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { King, KingFactory, KingFactory__factory, King__factory } from "../typechain-types";
import { MyKingAttack, MyKingAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("10. King level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<KingFactory, King>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, KingFactory__factory, (address, signer) =>
      King__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // check the current king
    const king = await level.instance._king();
    const owner = await level.instance.owner();
    expect(king).to.be.eq(owner);

    // deploy attacker contract
    const attackFactory: MyKingAttack__factory = new MyKingAttack__factory(context.player);
    const attackContract: MyKingAttack = await attackFactory.deploy(level.instance, {});
    await attackContract.waitForDeployment();

    // get the current prize
    const prize = await level.instance.prize();

    // try to attack target contract through attacker contract with wrong value
    await expect(attackContract.connect(context.player).attack({ value: 1 }))
      .to.be.revertedWithCustomError(attackContract, "ValueIsLessThanPrize")
      .withArgs(1, prize);

    // attack target contract through attacker contract and become the king
    const attack = await attackContract.connect(context.player).attack({ value: prize + 1n });
    await expect(await attack.wait()).not.to.be.reverted;

    // check the target contract prize
    expect(await level.instance.prize()).to.be.eq(prize + 1n);

    //check the target contract king
    expect(await level.instance._king()).to.be.eq(attackContract);

    await completeLevel(context, level);

    //check the target contract king does not change, it's still attacker contract
    expect(await level.instance._king()).to.be.eq(attackContract);
  });
});
