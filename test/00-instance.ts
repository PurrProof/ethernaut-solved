import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

import { Instance, InstanceFactory, InstanceFactory__factory, Instance__factory } from "../typechain-types";
import { FixtureContext, FixtureLevel, deployEssentials, deployLevel } from "./fixtures";
import { completeLevel } from "./helpers";

describe("Instance level", function () {
  let context: FixtureContext;
  let level: FixtureLevel<InstanceFactory, Instance>;

  beforeEach(async function () {
    context = await loadFixture(deployEssentials);
    level = await deployLevel(context, InstanceFactory__factory, (address, signer) =>
      Instance__factory.connect(address, signer),
    );
  });

  it("should be attacked successfully", async function () {
    const info = await level.instance.info();
    expect(info).to.be.eq("You will find what you need in info1().");

    const info1 = await level.instance.info1();
    expect(info1).to.be.eq('Try info2(), but with "hello" as a parameter.');

    const info2 = await level.instance.info2("hello");
    expect(info2).to.be.eq("The property infoNum holds the number of the next info method to call.");

    const infoNum = await level.instance.infoNum();
    expect(infoNum).to.be.eq(42);

    const info42 = await level.instance.info42();
    expect(info42).to.be.eq("theMethodName is the name of the next method.");

    const theMethodName = await level.instance.theMethodName();
    expect(theMethodName).to.be.eq("The method name is method7123949.");

    const method7123949 = await level.instance.method7123949();
    expect(method7123949).to.be.eq("If you know the password, submit it to authenticate().");

    // get password from public state variable
    const password = await level.instance.password();

    // submit passsword to authenticate()
    const tx = await (await level.instance.authenticate(password)).wait();
    await expect(tx).to.be.not.reverted;

    const cleared = await level.instance.getCleared();
    expect(cleared).to.be.true;

    await completeLevel(context, level);
  });
});
