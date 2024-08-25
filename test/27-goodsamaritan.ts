import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  Coin,
  Coin__factory,
  GoodSamaritan,
  GoodSamaritanFactory,
  GoodSamaritanFactory__factory,
  GoodSamaritan__factory,
  Wallet,
  Wallet__factory,
} from "../typechain-types";
import { MyGoodSamaritanAttack, MyGoodSamaritanAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("27. Good Samaritan", function () {
  let context: FixtureContext;
  let level: FixtureLevel<GoodSamaritanFactory, GoodSamaritan>;
  const TOTAL = 10 ** 6;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, GoodSamaritanFactory__factory, (address, signer) =>
      GoodSamaritan__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully through attacker contract", async function () {
    // deploy attacker contract
    const attackFactory: MyGoodSamaritanAttack__factory = new MyGoodSamaritanAttack__factory(context.player);
    const attackContract: MyGoodSamaritanAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    const coin: Coin = Coin__factory.connect(await level.instance.coin(), context.player);
    const wallet: Wallet = Wallet__factory.connect(await level.instance.wallet(), context.player);

    expect(await coin.balances(attackContract)).to.be.eq(0);
    expect(await coin.balances(wallet)).to.be.eq(TOTAL);

    const tx = await attackContract.requestDonation(level.instance);
    await tx.wait();
    await expect(tx).to.be.not.reverted;

    expect(await coin.balances(wallet)).to.be.eq(0);
    expect(await coin.balances(attackContract)).to.be.eq(TOTAL);

    await completeLevel(context, level);
  });
});
