import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Shop, ShopFactory, ShopFactory__factory, Shop__factory } from "../typechain-types";
import { MyShopAttack, MyShopAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("21. Shop level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<ShopFactory, Shop>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, ShopFactory__factory, (address, signer) =>
      Shop__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // deploy attacker contract
    const attackFactory: MyShopAttack__factory = new MyShopAttack__factory(context.player);
    const attackContract: MyShopAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    expect(await level.instance.price()).to.be.eq(100);
    expect(await level.instance.isSold()).to.be.false;

    const tx = await attackContract.buy();
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    // check whether price/isSold changed
    expect(await level.instance.price()).to.be.eq(0);
    expect(await level.instance.isSold()).to.be.true;

    await completeLevel(context, level);
  });
});
