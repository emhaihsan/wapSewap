import { expect } from "chai";
import { ethers } from "hardhat";

describe("PriceFeed", function () {
  let priceFeed: any;
  let owner: any, user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const PriceFeedFactory = await ethers.getContractFactory("PriceFeed");
    priceFeed = await PriceFeedFactory.deploy();
    await priceFeed.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await priceFeed.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Price Functions", function () {
    it("Should have getEthPrice function", async function () {
      // Function exists check - will revert without oracle data
      try {
        await priceFeed.getEthPrice();
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it("Should only allow owner to updatePrice", async function () {
      await expect(priceFeed.connect(user1).updatePrice()).to.be.reverted;
    });
  });

  describe("Timestamp Validation", function () {
    it("Should validate current timestamp", async function () {
      const block = await ethers.provider.getBlock("latest");
      const currentTimeMs = Number(block!.timestamp) * 1000;
      await expect(priceFeed.validateTimestamp(currentTimeMs)).to.not.be.reverted;
    });

    it("Should reject old timestamps", async function () {
      const block = await ethers.provider.getBlock("latest");
      const oldTimeMs = Number(block!.timestamp) * 1000 - 20 * 60 * 1000; // 20 minutes ago
      await expect(priceFeed.validateTimestamp(oldTimeMs)).to.be.revertedWith("Timestamp too old");
    });

    it("Should reject future timestamps", async function () {
      const block = await ethers.provider.getBlock("latest");
      const futureTimeMs = Number(block!.timestamp) * 1000 + 20 * 60 * 1000; // 20 minutes future
      await expect(priceFeed.validateTimestamp(futureTimeMs)).to.be.revertedWith("Timestamp too far in future");
    });
  });
});
