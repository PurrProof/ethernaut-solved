import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { MagicNum, MagicNumFactory, MagicNumFactory__factory, MagicNum__factory } from "../typechain-types";
import { MyMagicNumAttack, MyMagicNumAttack__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("18. Magic Number", function () {
  const THE_ANSWER = "0x000000000000000000000000000000000000000000000000000000000000002a";
  let context: FixtureContext;
  let level: FixtureLevel<MagicNumFactory, MagicNum>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, MagicNumFactory__factory, (address, signer) =>
      MagicNum__factory.connect(address, signer),
    );
  });

  it("should be successfully attacked via smart contract deployed as raw bytecode", async function () {
    /*
    // init code
    PUSH1 0x0a  // sizecopy, 10 bytes (decimal) is size of runtime code
    PUSH1 0x0c  // offset, 13 bytes (decimal) is size of init code
    PUSH1 0x00  // destOffset, target offset in memory
    CODECOPY    // destOffset, offset, sizecopy => runtime bytecode into memory
    PUSH1 0x0a  // size, 10 bytes (decimal) is size of runtime code
    PUSH1 0x00  // offset
    RETURN      // offset, size => halt execution, return data from memory

    // run time code
    PUSH1 0x2a  // value, 42 decimal
    PUSH1 0x00  // offset
    MSTORE      // offset, value => save word (32 bytes) to memory
    PUSH1 0x20  // size
    PUSH1 0x00  // offset
    RETURN      // offset, size => halt execution, return data (32 bytes here) from memory
    */

    const bytecode = "600a600c600039600a6000f3602a60005260206000f3";
    const factory = new hre.ethers.ContractFactory([], bytecode, context.player);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    expect(
      await hre.ethers.provider.call({
        to: await contract.getAddress(),
        data: hre.ethers.id("whatIsTheMeaningOfLife()"), //actually any signature will work
        from: context.player,
      }),
    ).to.be.eq(THE_ANSWER);

    const tx = await level.instance.setSolver(await contract.getAddress());
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    await completeLevel(context, level);
  });

  it("should be successfully attacked via contract whose runtime code constructed with assembly", async function () {
    const attackFactory: MyMagicNumAttack__factory = new MyMagicNumAttack__factory(context.player);
    const attackContract: MyMagicNumAttack = await attackFactory.deploy();
    await attackContract.waitForDeployment();

    expect(
      await hre.ethers.provider.call({
        to: await attackContract.getAddress(),
        data: hre.ethers.id("whatIsTheMeaningOfLife()"), //actually any signature will work
        from: context.player,
      }),
    ).to.be.eq(THE_ANSWER);

    const tx = await level.instance.setSolver(await attackContract.getAddress());
    await expect(tx).to.be.not.reverted;
    await tx.wait();

    await completeLevel(context, level);
  });
});
