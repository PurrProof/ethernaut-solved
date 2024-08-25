import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  DoubleEntryPoint,
  DoubleEntryPointFactory,
  DoubleEntryPointFactory__factory,
  DoubleEntryPoint__factory,
} from "../typechain-types";
import { MyDoubleEntryDetectionBot, MyDoubleEntryDetectionBot__factory } from "../typechain-types";
import { CryptoVault, CryptoVault__factory } from "../typechain-types";
import { LegacyToken, LegacyToken__factory } from "../typechain-types";
import { Forta, Forta__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("26. Double Entry Point", function () {
  let context: FixtureContext;
  let level: FixtureLevel<DoubleEntryPointFactory, DoubleEntryPoint>;
  let vault: CryptoVault;
  let legacy: LegacyToken;
  let forta: Forta;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, DoubleEntryPointFactory__factory, (address, signer) =>
      DoubleEntryPoint__factory.connect(address, signer),
    );
    vault = CryptoVault__factory.connect(await level.instance.cryptoVault(), context.player);
    legacy = LegacyToken__factory.connect(await level.instance.delegatedFrom(), context.player);
    forta = Forta__factory.connect(await level.instance.forta(), context.player);
  });

  it("should not be possible to sweep underliying token directly", async function () {
    // level.instance is new token = DoubleEntryPoint token
    await expect(vault.sweepToken(level.instance)).to.be.revertedWith("Can't transfer underlying token");
  });

  it("should be possible to sweep underliying token through legacy token", async function () {
    expect(await level.instance.balanceOf(vault)).to.be.greaterThan(0);
    const tx = await vault.sweepToken(legacy);
    await expect(tx).to.be.not.reverted;
    expect(await level.instance.balanceOf(vault)).to.be.eq(0);
  });
  it("should not be possible to sweep underliying token when detection bot is set", async function () {
    const botFactory: MyDoubleEntryDetectionBot__factory = new MyDoubleEntryDetectionBot__factory(context.player);
    const botContract: MyDoubleEntryDetectionBot = await botFactory.deploy(vault);
    await botContract.waitForDeployment();

    const tx = await forta.connect(context.player).setDetectionBot(botContract);
    await expect(tx).to.be.not.reverted;

    expect(await level.instance.balanceOf(vault)).to.be.greaterThan(0);
    await expect(vault.sweepToken(legacy)).to.be.revertedWith("Alert has been triggered, reverting");
    expect(await level.instance.balanceOf(vault)).to.be.greaterThan(0);

    await completeLevel(context, level);
  });

  it;
});
