import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { Recovery, RecoveryFactory, RecoveryFactory__factory, Recovery__factory } from "../typechain-types";
import { RecoverySimpleToken, RecoverySimpleToken__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("17. Recovery", function () {
  let context: FixtureContext;
  let level: FixtureLevel<RecoveryFactory, Recovery>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, RecoveryFactory__factory, (address, signer) =>
      Recovery__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    // new contract addresses are deterministic, address = keccak(creatorAddress, nonce)
    // creator == EOA ? nonce[0,n] : nonce[1,n]
    // for SCA, nonce means number of spawned contracts
    const tokenAddress = hre.ethers.getCreateAddress({ from: await level.instance.getAddress(), nonce: 1 });

    const recoveryToken: RecoverySimpleToken = RecoverySimpleToken__factory.connect(tokenAddress, context.player);

    const destroyTx = await recoveryToken.destroy(context.player);
    await expect(destroyTx).to.be.not.reverted;
    await destroyTx.wait();

    expect(await hre.ethers.provider.getBalance(level.instance)).to.be.eq(0);

    await completeLevel(context, level);
  });
});
