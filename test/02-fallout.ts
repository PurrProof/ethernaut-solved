import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Fallout, FalloutFactory, FalloutFactory__factory, Fallout__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("2. Fallout", function () {
  let context: FixtureContext;
  let level: FixtureLevel<FalloutFactory, Fallout>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, FalloutFactory__factory, (address, signer) =>
      Fallout__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const tx = await level.instance.Fal1out();
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    // check owner is player
    expect(await level.instance.owner()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
