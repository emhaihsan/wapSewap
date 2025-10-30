import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleDEX", function () {
  let dex: any;
  let token0: any, token1: any;
  let owner: any, user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

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

    // Transfer tokens to user
    await token0.transfer(user1.address, ethers.parseUnits("10000", 18));
    await token1.transfer(user1.address, ethers.parseUnits("20000", 6));
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

      await dex.addLiquidity(amount0, amount1);

      const [reserve0, reserve1] = await dex.getReserves();
      expect(reserve0).to.equal(amount0);
      expect(reserve1).to.equal(amount1);
    });
  });

  describe("Swap", function () {
    beforeEach(async function () {
      // Add initial liquidity
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);

      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);
    });

    it("Should swap token0 for token1", async function () {
      const swapAmount = ethers.parseUnits("10", 18);

      await token0.connect(user1).approve(await dex.getAddress(), swapAmount);

      const user1BalBefore = await token1.balanceOf(user1.address);
      await dex.connect(user1).swap(await token0.getAddress(), swapAmount, 0);
      const user1BalAfter = await token1.balanceOf(user1.address);

      expect(user1BalAfter).to.be.gt(user1BalBefore);
    });

    it("Should swap token1 for token0", async function () {
      const swapAmount = ethers.parseUnits("20", 6);

      await token1.connect(user1).approve(await dex.getAddress(), swapAmount);

      const user1BalBefore = await token0.balanceOf(user1.address);
      await dex.connect(user1).swap(await token1.getAddress(), swapAmount, 0);
      const user1BalAfter = await token0.balanceOf(user1.address);

      expect(user1BalAfter).to.be.gt(user1BalBefore);
    });
  });

  describe("Remove Liquidity", function () {
    it("Should remove liquidity", async function () {
      const amount0 = ethers.parseUnits("1000", 18);
      const amount1 = ethers.parseUnits("2000", 6);

      await token0.approve(await dex.getAddress(), amount0);
      await token1.approve(await dex.getAddress(), amount1);
      await dex.addLiquidity(amount0, amount1);

      const liquidity = await dex.getUserLiquidity(owner.address);
      await dex.removeLiquidity(liquidity);

      const [reserve0, reserve1] = await dex.getReserves();
      expect(reserve0).to.equal(0);
      expect(reserve1).to.equal(0);
    });
  });
});
