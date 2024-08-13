import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  GatekeeperOne,
  GatekeeperOneFactory,
  GatekeeperOneFactory__factory,
  GatekeeperOne__factory,
} from "../typechain-types";
import { MyGateKeeper1Attack, MyGateKeeper1Attack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("13. Gate Keeper One", function () {
  let context: FixtureContext;
  let level: FixtureLevel<GatekeeperOneFactory, GatekeeperOne>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, GatekeeperOneFactory__factory, (address, signer) =>
      GatekeeperOne__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyGateKeeper1Attack__factory = new MyGateKeeper1Attack__factory(context.player);
    const attackContract: MyGateKeeper1Attack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    const tx = await attackContract.attack(level.instance);
    await tx.wait();

    // check entrant is tx.origin
    expect(await level.instance.entrant()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
