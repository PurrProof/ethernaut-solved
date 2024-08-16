import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { AlienCodex, AlienCodexFactory, AlienCodexFactory__factory, AlienCodex__factory } from "../typechain-types";
import { MyAlienCodexAttack, MyAlienCodexAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("19. Alien Codex", function () {
  let context: FixtureContext;
  let level: FixtureLevel<AlienCodexFactory, AlienCodex>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, AlienCodexFactory__factory, (address, signer) =>
      AlienCodex__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyAlienCodexAttack__factory = new MyAlienCodexAttack__factory(context.player);
    const attackContract: MyAlienCodexAttack = await attackFactory.deploy(level.instance, context.player);
    await attackContract.waitForDeployment();

    // check ownership
    expect(await level.instance.owner()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
