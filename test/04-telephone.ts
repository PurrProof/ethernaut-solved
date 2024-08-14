import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Telephone, TelephoneFactory, TelephoneFactory__factory, Telephone__factory } from "../typechain-types";
import { MyTelephoneAttack, MyTelephoneAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("4. Telephone", function () {
  let context: FixtureContext;
  let level: FixtureLevel<TelephoneFactory, Telephone>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, TelephoneFactory__factory, (address, signer) =>
      Telephone__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract (attack will be executed in the constructor)
    const attackFactory: MyTelephoneAttack__factory = new MyTelephoneAttack__factory(context.player);
    const attackContract: MyTelephoneAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    // check target contract owner
    expect(await level.instance.owner()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
