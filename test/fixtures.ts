import { SignerWithAddress as HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { BaseContract, ContractFactory, EventLog } from "ethers";
import hre from "hardhat";

import { Ethernaut, Ethernaut__factory, Statistics, Statistics__factory } from "../typechain-types";

export interface FixtureContext {
  owner: HardhatEthersSigner;
  player: HardhatEthersSigner;
  ethernaut: Ethernaut;
  statistics: Statistics;
}

export interface FixtureLevel<TLevel extends BaseContract, TInstance extends BaseContract> {
  factory: TLevel;
  instance: TInstance;
}

export async function deployEssentials(): Promise<FixtureContext> {
  const [owner, player] = await hre.ethers.getSigners();

  const ethernaut = await new Ethernaut__factory(owner).deploy();
  await ethernaut.waitForDeployment();

  const statistics = await new Statistics__factory(owner).deploy();
  await statistics.waitForDeployment();

  const tx1 = await statistics.initialize(await ethernaut.getAddress());
  await tx1.wait();
  const tx2 = await ethernaut.setStatistics(await statistics.getAddress());
  await tx2.wait();

  return { owner, player, ethernaut, statistics };
}

export async function deployLevel<
  TFactory extends ContractFactory,
  TInstance extends BaseContract,
  TLevel extends BaseContract,
>(
  context: { ethernaut: Ethernaut; owner: HardhatEthersSigner; player: HardhatEthersSigner },
  LevelFactory: new (signer: HardhatEthersSigner) => TFactory,
  InstanceFactory: (address: string, signer: HardhatEthersSigner) => TInstance,
): Promise<FixtureLevel<TLevel, TInstance>> {
  // deploy level
  const levelFactory__factory = new LevelFactory(context.owner);
  const levelFactory = (await levelFactory__factory.connect(context.owner).deploy()) as TLevel;
  await levelFactory.waitForDeployment();

  // register level in the ethernaut
  await (await context.ethernaut.connect(context.owner).registerLevel(levelFactory)).wait();

  // create an instance and get its address
  const tx = await context.ethernaut
    .connect(context.player)
    .createLevelInstance(levelFactory, { value: hre.ethers.parseUnits("0.001", "ether") });
  const receipt = await tx.wait();
  if (!receipt?.logs || receipt.logs.length === 0) {
    expect.fail("Transaction receipt logs are empty. Instance creation might have failed.");
  }

  // we need LevelInstanceCreatedLog, it goes last
  const logIndex = receipt.logs.length - 1;
  const instanceAddress: string = (receipt.logs[logIndex] as EventLog).args[1] as string;

  // verify instance creation event
  await expect(receipt)
    .to.emit(context.ethernaut, "LevelInstanceCreatedLog")
    .withArgs(context.player, instanceAddress, levelFactory);

  // connect instanceAddress to instance contract object
  const instance = InstanceFactory(instanceAddress, context.player);

  return { factory: levelFactory, instance };
}
