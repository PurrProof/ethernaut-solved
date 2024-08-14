import { loadFixture, mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { CoinFlip, CoinFlipFactory, CoinFlipFactory__factory, CoinFlip__factory } from "../typechain-types";
import { MyCoinFlipAttack, MyCoinFlipAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("3. Coin Flip", function () {
  let context: FixtureContext;
  let level: FixtureLevel<CoinFlipFactory, CoinFlip>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, CoinFlipFactory__factory, (address, signer) =>
      CoinFlip__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyCoinFlipAttack__factory = new MyCoinFlipAttack__factory(context.player);
    const attackContract: MyCoinFlipAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    const consecWins = 10;
    for (let i = 1; i <= consecWins; ++i) {
      const tx = await attackContract.attack();
      await expect(tx).to.be.not.reverted;
      await tx.wait();
      // wait for the next block, because target contract allows one guess per block
      await mine();
    }

    // check consecutive wins conut
    expect(await level.instance.consecutiveWins()).to.be.eq(consecWins);

    await completeLevel(context, level);
  });
});
