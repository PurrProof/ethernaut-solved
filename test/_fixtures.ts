import { SignerWithAddress as HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";

import { Ethernaut, Ethernaut__factory, Statistics, Statistics__factory } from "../typechain-types";

export interface FixtureAll {
  owner: HardhatEthersSigner;
  player: HardhatEthersSigner;
  ethernaut: Ethernaut;
  statistics: Statistics;
}

export async function deployAll(): Promise<FixtureAll> {
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
