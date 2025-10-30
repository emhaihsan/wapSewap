import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleUSDC } from "../typechain-types";

describe("SimpleUSDC", function () {
  let usdc: SimpleUSDC;
  let owner: any, user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const USDCFactory = await ethers.getContractFactory("SimpleUSDC");
    usdc = await USDCFactory.deploy();
    await usdc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct properties", async function () {
      expect(await usdc.name()).to.equal("SimpleUSDC");
      expect(await usdc.symbol()).to.equal("sUSDC");
      expect(await usdc.decimals()).to.equal(6);
    });

    it("Should mint 1,000,000 sUSDC to deployer", async function () {
      const balance = await usdc.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseUnits("1000000", 6));
    });
  });

  describe("6 Decimals", function () {
    it("Should handle 6 decimal precision correctly", async function () {
      const amount = ethers.parseUnits("100.123456", 6);
      await usdc.transfer(user1.address, amount);

      expect(await usdc.balanceOf(user1.address)).to.equal(amount);
    });
  });
});
