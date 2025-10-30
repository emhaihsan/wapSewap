import { expect } from "chai";
import { ethers } from "hardhat";

describe("DEXFactory", function () {
  let factory: any;
  let token0: any, token1: any;

  beforeEach(async function () {
    // Deploy tokens
    const TokenFactory = await ethers.getContractFactory("WapsewapToken");
    const USDCFactory = await ethers.getContractFactory("SimpleUSDC");
    
    token0 = await TokenFactory.deploy();
    token1 = await USDCFactory.deploy();
    await token0.waitForDeployment();
    await token1.waitForDeployment();

    // Deploy Factory
    const FactoryContract = await ethers.getContractFactory("DEXFactory");
    factory = await FactoryContract.deploy();
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with zero pairs", async function () {
      expect(await factory.allPairsLength()).to.equal(0);
    });
  });

  describe("Pair Creation", function () {
    it("Should create new pair", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);

      const pairAddress = await factory.getPair(token0Address, token1Address);
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
      expect(await factory.allPairsLength()).to.equal(1);
    });

    it("Should create bidirectional mapping", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);

      const pair1 = await factory.getPair(token0Address, token1Address);
      const pair2 = await factory.getPair(token1Address, token0Address);
      expect(pair1).to.equal(pair2);
    });

    it("Should fail to create duplicate pair", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);
      await expect(factory.createPair(token0Address, token1Address)).to.be.reverted;
    });
  });
});
