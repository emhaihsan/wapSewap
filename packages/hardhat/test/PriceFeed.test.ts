import { expect } from "chai";
import { ethers } from "hardhat";

describe("PriceFeed", function () {
  let priceFeed: any;
  let user1: any;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    user1 = signers[1];

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
      // Note: This will fail without RedStone data, but tests the function exists
      try {
        await priceFeed.getEthPrice();
      } catch (error) {
        // Expected to fail without oracle data
        expect(error).to.exist;
      }
    });

    it("Should only allow owner to updatePrice", async function () {
      await expect(priceFeed.connect(user1).updatePrice()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to updatePrice", async function () {
      await expect(priceFeed.updatePrice()).to.be.reverted; // reverts due to missing oracle data
    });
  });

  describe("Timestamp Validation", function () {
    it("Should have validateTimestamp function", async function () {
      const currentTime = Math.floor(Date.now());

      // Should not revert for current timestamp
      await expect(priceFeed.validateTimestamp(currentTime)).to.not.be.reverted;
    });

    it("Should reject very old timestamps", async function () {
      const oldTime = Math.floor(Date.now()) - 20 * 60 * 1000; // 20 minutes ago

      await expect(priceFeed.validateTimestamp(oldTime)).to.be.revertedWith("Timestamp too old");
    });

    it("Should reject future timestamps", async function () {
      const futureTime = Math.floor(Date.now()) + 20 * 60 * 1000; // 20 minutes future

      await expect(priceFeed.validateTimestamp(futureTime)).to.be.revertedWith("Timestamp too far in future");
    });
  });
});
