import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import {
  PuzzleProxy,
  PuzzleProxy__factory,
  PuzzleWalletFactory,
  PuzzleWalletFactory__factory,
} from "../typechain-types";
import { MyPuzzleWalletAttack, MyPuzzleWalletAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("24. Puzzle Wallet", function () {
  let context: FixtureContext;
  let level: FixtureLevel<PuzzleWalletFactory, PuzzleProxy>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, PuzzleWalletFactory__factory, (address, signer) =>
      PuzzleProxy__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully through attacker contract", async function () {
    const balance = await hre.ethers.provider.getBalance(level.instance);
    // deploy attacker contract
    const attackFactory: MyPuzzleWalletAttack__factory = new MyPuzzleWalletAttack__factory(context.player);
    const attackContract: MyPuzzleWalletAttack = await attackFactory.deploy(level.instance, {
      value: balance,
    });
    await attackContract.waitForDeployment();

    expect(await level.instance.admin()).to.be.eq(await context.player.getAddress());
    expect(await hre.ethers.provider.getBalance(level.instance)).to.be.eq(0);

    await completeLevel(context, level);
  });
});
