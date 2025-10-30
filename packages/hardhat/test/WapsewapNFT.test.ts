import { expect } from "chai";
import { ethers } from "hardhat";

describe("WapsewapNFT", function () {
  let nft: any;
  let owner: any, user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const NFTFactory = await ethers.getContractFactory("WapsewapNFT");
    nft = await NFTFactory.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await nft.name()).to.equal("WapsewapNFT");
      expect(await nft.symbol()).to.equal("WSN");
    });

    it("Should start with zero supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFT", async function () {
      await nft.mint(user1.address);

      expect(await nft.totalSupply()).to.equal(1);
      expect(await nft.ownerOf(0)).to.equal(user1.address);
    });

    it("Should increment token ID", async function () {
      await nft.mint(user1.address);
      await nft.mint(user1.address);

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.ownerOf(1)).to.equal(user1.address);
    });

    it("Should fail if not owner", async function () {
      await expect(nft.connect(user1).mint(user1.address)).to.be.reverted;
    });
  });

  describe("Token URI", function () {
    it("Should return token URI", async function () {
      await nft.mint(user1.address);
      const uri = await nft.tokenURI(0);
      expect(uri).to.include("https://gateway.pinata.cloud/ipfs/");
    });
  });
});
