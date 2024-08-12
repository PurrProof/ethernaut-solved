import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Privacy, PrivacyFactory, PrivacyFactory__factory, Privacy__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("12. Privacy level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<PrivacyFactory, Privacy>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, PrivacyFactory__factory, (address, signer) =>
      Privacy__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const SLOTNUM = 5;

    const slotContents = await hre.ethers.provider.getStorage(level.instance, SLOTNUM);

    hre.ethers.toBeArray;
    const bytes32 = hre.ethers.toUtf8Bytes(slotContents);
    const bytes16 = bytes32.slice(0, 34);
    const password = hre.ethers.toUtf8String(bytes16);

    const tx = await level.instance.unlock(password);
    await expect(tx).not.be.reverted;
    await tx.wait();

    expect(await level.instance.locked()).to.be.false;

    await completeLevel(context, level);
  });
});
