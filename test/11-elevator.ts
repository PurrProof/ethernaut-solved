import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Elevator, ElevatorFactory, ElevatorFactory__factory, Elevator__factory } from "../typechain-types";
import { MyElevatorAttack, MyElevatorAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("11. Elevator level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<ElevatorFactory, Elevator>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, ElevatorFactory__factory, (address, signer) =>
      Elevator__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const FLOOR = 10;

    // deploy attacker contract
    const attackFactory: MyElevatorAttack__factory = new MyElevatorAttack__factory(context.player);
    const attackContract: MyElevatorAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    const curFloor = await level.instance.floor();
    expect(curFloor).to.be.eq(0);
    expect(await level.instance.top()).to.be.false;

    // try to attack target contract when floor argument equals to target.floor state variable
    const test = await attackContract.connect(context.player).attack(level.instance, curFloor);
    await expect(await test.wait()).not.to.be.reverted;

    // sure that current level/top not changed
    expect(await level.instance.floor()).to.be.eq(0);
    expect(await level.instance.top()).to.be.false;

    // attack target contract with the floor argument which differs from target's floor
    const attack = await attackContract.connect(context.player).attack(level.instance, FLOOR);
    await expect(await attack.wait()).not.to.be.reverted;

    // check whether level/top changed
    expect(await level.instance.floor()).to.be.eq(FLOOR);
    expect(await level.instance.top()).to.be.true;

    await completeLevel(context, level);
  });
});
