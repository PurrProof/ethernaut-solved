import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { BaseContract } from "ethers";
import hre from "hardhat";

import { ForceFactory, ForceFactory__factory } from "../typechain-types";
import { MyForceAttack, MyForceAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("7. Force", function () {
  let context: FixtureContext;
  let level: FixtureLevel<ForceFactory, BaseContract>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);

    const forceArtif = await hre.artifacts.readArtifact("Force");
    level = await deployLevel(context, ForceFactory__factory, (address, signer) =>
      new BaseContract("Force", forceArtif.abi, signer).attach(address),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract (attack will be executed in the constructor)
    // if contract sends funds on selfdestruct, EVM can't deny it
    const attackFactory: MyForceAttack__factory = new MyForceAttack__factory(context.player);
    const attackContract: MyForceAttack = await attackFactory.deploy(level.instance, { value: 1 });
    await attackContract.waitForDeployment();

    // check target contract balance
    expect(await hre.ethers.provider.getBalance(level.instance)).to.be.eq(1);

    await completeLevel(context, level);
  });
});
