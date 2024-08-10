import { expect } from "chai";
import { BaseContract } from "ethers";

import { FixtureContext, FixtureLevel } from "./fixtures";

export async function completeLevel<TLevel extends BaseContract, TInstance extends BaseContract>(
  context: FixtureContext,
  level: FixtureLevel<TLevel, TInstance>,
) {
  // submit instance, check LevelCompleted event
  const rcptSubmit = await (await context.ethernaut.connect(context.player).submitLevelInstance(level.instance)).wait();
  await expect(rcptSubmit)
    .to.emit(context.ethernaut, "LevelCompletedLog")
    .withArgs(context.player, level.instance, level.factory);
}
