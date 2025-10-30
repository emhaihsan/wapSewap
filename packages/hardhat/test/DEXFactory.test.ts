import { expect } from "chai";
import { ethers } from "hardhat";

describe("DEXFactory", function () {
  let factory: any;
  let token0: any, token1: any, token2: any;

  beforeEach(async function () {
    // Deploy tokens
    const TokenFactory = await ethers.getContractFactory("WapsewapToken");
    const USDCFactory = await ethers.getContractFactory("SimpleUSDC");
    token0 = await TokenFactory.deploy();
    token1 = await USDCFactory.deploy();
    token2 = await TokenFactory.deploy();
    await token0.waitForDeployment();
    await token1.waitForDeployment();
    await token2.waitForDeployment();

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

      // Create pair and wait for transaction
      const tx = await factory.createPair(token0Address, token1Address);
      await tx.wait();

      // Check pair was created
      const pairAddress = await factory.getPair(token0Address, token1Address);
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
      expect(await factory.allPairsLength()).to.equal(1);

      // Verify event was emitted
      await expect(tx).to.emit(factory, "PairCreated").withArgs(token0Address, token1Address, pairAddress, 1);
    });

    it("Should create bidirectional mapping", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);

      const pair1 = await factory.getPair(token0Address, token1Address);
      const pair2 = await factory.getPair(token1Address, token0Address);

      expect(pair1).to.equal(pair2);
      expect(pair1).to.not.equal(ethers.ZeroAddress);
    });

    it("Should fail if pair already exists", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);

      await expect(factory.createPair(token0Address, token1Address)).to.be.revertedWith("Pair already exists");
    });

    it("Should fail with identical tokens", async function () {
      const token0Address = await token0.getAddress();

      await expect(factory.createPair(token0Address, token0Address)).to.be.revertedWith("Tokens must be different");
    });

    it("Should fail with zero address", async function () {
      const token0Address = await token0.getAddress();

      await expect(factory.createPair(token0Address, ethers.ZeroAddress)).to.be.revertedWith("Invalid token address");
    });
  });

  describe("Multiple Pairs", function () {
    it("Should create multiple pairs", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();
      const token2Address = await token2.getAddress();

      await factory.createPair(token0Address, token1Address);
      await factory.createPair(token0Address, token2Address);
      await factory.createPair(token1Address, token2Address);

      expect(await factory.allPairsLength()).to.equal(3);
    });

    it("Should return correct pair at index", async function () {
      const token0Address = await token0.getAddress();
      const token1Address = await token1.getAddress();

      await factory.createPair(token0Address, token1Address);

      const pairAddress = await factory.getPairAt(0);
      expect(pairAddress).to.equal(await factory.getPair(token0Address, token1Address));
    });
  });
});
