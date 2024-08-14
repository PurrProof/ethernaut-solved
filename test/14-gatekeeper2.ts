import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  GatekeeperTwo,
  GatekeeperTwoFactory,
  GatekeeperTwoFactory__factory,
  GatekeeperTwo__factory,
} from "../typechain-types";
import { MyGateKeeper2Attack, MyGateKeeper2Attack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("14. Gate Keeper Two", function () {
  let context: FixtureContext;
  let level: FixtureLevel<GatekeeperTwoFactory, GatekeeperTwo>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, GatekeeperTwoFactory__factory, (address, signer) =>
      GatekeeperTwo__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyGateKeeper2Attack__factory = new MyGateKeeper2Attack__factory(context.player);
    const attackContract: MyGateKeeper2Attack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    // check entrant is tx.origin
    expect(await level.instance.entrant()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
