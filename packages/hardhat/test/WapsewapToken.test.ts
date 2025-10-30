import { expect } from "chai";
import { ethers } from "hardhat";
import { WapsewapToken } from "../typechain-types";

describe("WapsewapToken", function () {
  let token: WapsewapToken;
  let owner: any, user1: any, user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("WapsewapToken");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name, symbol, and decimals", async function () {
      expect(await token.name()).to.equal("WapsewapToken");
      expect(await token.symbol()).to.equal("WSP");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should mint 1,000,000 WSP to deployer", async function () {
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseUnits("1000000", 18));
    });

    it("Should have correct total supply", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseUnits("1000000", 18));
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.transfer(user1.address, amount);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("999900", 18));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const amount = ethers.parseUnits("1", 18);
      await expect(token.connect(user1).transfer(user2.address, amount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });
  });

  describe("Allowances", function () {
    it("Should approve and transferFrom correctly", async function () {
      const amount = ethers.parseUnits("100", 18);

      await token.approve(user1.address, amount);
      expect(await token.allowance(owner.address, user1.address)).to.equal(amount);

      await token.connect(user1).transferFrom(owner.address, user2.address, amount);
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });
  });
});
