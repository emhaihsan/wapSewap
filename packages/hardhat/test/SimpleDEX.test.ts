import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleDEX, WapsewapToken, SimpleUSDC } from "../typechain-types";

describe("SimpleDEX", function () {
  let dex: SimpleDEX;
  let token0: WapsewapToken, token1: SimpleUSDC;
  let owner: any, user1: any, user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const Token0Factory = await ethers.getContractFactory("WapsewapToken");
    const Token1Factory = await ethers.getContractFactory("SimpleUSDC");
    token0 = await Token0Factory.deploy();
    token1 = await Token1Factory.deploy();
    await token0.waitForDeployment();
    await token1.waitForDeployment();

    // Deploy DEX
    const DEXFactory = await ethers.getContractFactory("SimpleDEX");
    dex = await DEXFactory.deploy(await token0.getAddress(), await token1.getAddress());
    await dex.waitForDeployment();

    // Transfer tokens to users
    await token0.transfer(user1.address, ethers.parseUnits("10000", 18));
    await token1.transfer(user1.address, ethers.parseUnits("20000", 6));
    await token0.transfer(user2.address, ethers.parseUnits("5000", 18));
    await token1.transfer(user2.address, ethers.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set correct token addresses", async function () {
      expect(await dex.token0()).to.equal(await token0.getAddress());
      expect(await dex.token1()).to.equal(await token1.getAddress());
    });

    it("Should start with zero reserves", async function () {
      const [reserve0, reserve1] = await dex.getReserves();
      expect(reserve0).to.equal(0);
      expect(reserve1).to.equal(0);
    });
  });

  describe("Add Liquidity", function () {
    it("Should add initial liquidity", async function () {
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);

      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);

      await expect(dex.addLiquidity(amount0, amount1))
        .to.emit(dex, "LiquidityAdded")
        .withArgs(owner.address, amount0, amount1, amount0);

      const [reserve0, reserve1] = await dex.getReserves();
      expect(reserve0).to.equal(amount0);
      expect(reserve1).to.equal(amount1);
      expect(await dex.getUserLiquidity(owner.address)).to.equal(amount0);
    });

    it("Should maintain ratio for subsequent liquidity", async function () {
      // Add initial liquidity
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);
      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);

      // Add more liquidity with user1
      const user1Amount0 = ethers.parseUnits("500", 18);
      const user1Amount1 = ethers.parseUnits("1000", 6);
      await token0.connect(user1).approve(await dex.getAddress(), user1Amount0);
      await token1.connect(user1).approve(await dex.getAddress(), user1Amount1);
      await dex.connect(user1).addLiquidity(user1Amount0, user1Amount1);

      expect(await dex.getUserLiquidity(user1.address)).to.equal(ethers.parseUnits("500", 18));
    });
  });

  describe("Remove Liquidity", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);
      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);
    });

    it("Should remove liquidity proportionally", async function () {
      const liquidityToRemove = ethers.parseUnits("500", 18);

      await expect(dex.removeLiquidity(liquidityToRemove)).to.emit(dex, "LiquidityRemoved");

      expect(await dex.getUserLiquidity(owner.address)).to.equal(ethers.parseUnits("500", 18));
    });

    it("Should fail if insufficient liquidity", async function () {
      await expect(dex.removeLiquidity(ethers.parseUnits("2000", 18))).to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("Swap", function () {
    beforeEach(async function () {
      // Add liquidity
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);
      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);
    });

    it("Should swap token0 for token1", async function () {
      const swapAmount = ethers.parseUnits("10", 18);
      await token0.connect(user1).approve(await dex.getAddress(), swapAmount);

      const expectedOut = await dex.getSwapAmount(await token0.getAddress(), swapAmount);

      await expect(dex.connect(user1).swap(await token0.getAddress(), swapAmount, 0))
        .to.emit(dex, "Swapped")
        .withArgs(user1.address, await token0.getAddress(), swapAmount, expectedOut);
    });

    it("Should charge 0.3% fee", async function () {
      const swapAmount = ethers.parseUnits("100", 18);
      await token0.connect(user1).approve(await dex.getAddress(), swapAmount);

      const [fee0Before] = await dex.getAccumulatedFees();
      await dex.connect(user1).swap(await token0.getAddress(), swapAmount, 0);
      const [fee0After] = await dex.getAccumulatedFees();

      const expectedFee = (swapAmount * 3n) / 1000n; // 0.3%
      expect(fee0After - fee0Before).to.equal(expectedFee);
    });

    it("Should respect slippage protection", async function () {
      const swapAmount = ethers.parseUnits("10", 18);
      const minOut = ethers.parseUnits("1000", 6); // Too high

      await token0.connect(user1).approve(await dex.getAddress(), swapAmount);

      await expect(dex.connect(user1).swap(await token0.getAddress(), swapAmount, minOut)).to.be.revertedWith(
        "Insufficient output amount",
      );
    });
  });

  describe("Fee Distribution", function () {
    beforeEach(async function () {
      // Add liquidity from two users
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);

      // Owner adds 75% liquidity
      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);

      // User1 adds 25% liquidity
      const user1Amount0 = ethers.parseUnits("333", 18);
      const user1Amount1 = ethers.parseUnits("666", 6);
      await token0.connect(user1).approve(await dex.getAddress(), user1Amount0);
      await token1.connect(user1).approve(await dex.getAddress(), user1Amount1);
      await dex.connect(user1).addLiquidity(user1Amount0, user1Amount1);

      // Generate fees through swaps
      const swapAmount = ethers.parseUnits("100", 18);
      await token0.connect(user2).approve(await dex.getAddress(), swapAmount);
      await dex.connect(user2).swap(await token0.getAddress(), swapAmount, 0);
    });

    it("Should calculate claimable fees correctly", async function () {
      const [claimableFee0, claimableFee1] = await dex.getClaimableFees(owner.address);
      expect(claimableFee0).to.be.gt(0); // Should have some fees to claim
      expect(claimableFee1).to.be.gte(0); // Fee1 should be non-negative
    });

    it("Should allow claiming fees", async function () {
      const balanceBefore = await token0.balanceOf(owner.address);

      await expect(dex.claimFees()).to.emit(dex, "FeesClaimed");

      const balanceAfter = await token0.balanceOf(owner.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should fail if no liquidity position", async function () {
      await expect(dex.connect(user2).claimFees()).to.be.revertedWith("No liquidity position");
    });
  });

  describe("View Functions", function () {
    it("Should return correct swap amount preview", async function () {
      // Add liquidity first
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);
      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);

      const swapAmount = ethers.parseUnits("10", 18);
      const expectedOut = await dex.getSwapAmount(await token0.getAddress(), swapAmount);

      expect(expectedOut).to.be.gt(0);
      expect(expectedOut).to.be.lt(ethers.parseUnits("20", 6)); // Should be less than 2:1 ratio due to slippage
    });
  });
});
