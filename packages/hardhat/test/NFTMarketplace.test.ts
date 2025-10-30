import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarketplace", function () {
  let marketplace: any;
  let nft: any;
  let paymentToken: any;
  let owner: any, seller: any, buyer: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy WapsewapToken
    const TokenFactory = await ethers.getContractFactory("WapsewapToken");
    paymentToken = await TokenFactory.deploy();
    await paymentToken.waitForDeployment();

    // Deploy NFT
    const NFTFactory = await ethers.getContractFactory("WapsewapNFT");
    nft = await NFTFactory.deploy();
    await nft.waitForDeployment();

    // Deploy Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await MarketplaceFactory.deploy(
      await nft.getAddress(),
      await paymentToken.getAddress(),
      owner.address
    );
    await marketplace.waitForDeployment();

    // Mint NFT to seller
    await nft.mint(seller.address);

    // Mint WSP to buyer
    await paymentToken.transfer(buyer.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set correct addresses", async function () {
      expect(await marketplace.nft()).to.equal(await nft.getAddress());
      expect(await marketplace.paymentToken()).to.equal(await paymentToken.getAddress());
      expect(await marketplace.feeRecipient()).to.equal(owner.address);
    });

    it("Should have 1% fee", async function () {
      expect(await marketplace.FEE_BPS()).to.equal(100);
      expect(await marketplace.BPS()).to.equal(10000);
    });
  });

  describe("Listing", function () {
    it("Should list NFT for sale", async function () {
      const price = ethers.parseEther("10");

      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);

      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should fail if not approved", async function () {
      const price = ethers.parseEther("10");
      await expect(marketplace.connect(seller).listItem(0, price)).to.be.reverted;
    });
  });

  describe("Buying", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("10");
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);
    });

    it("Should buy NFT with WSP", async function () {
      const price = ethers.parseEther("10");

      await paymentToken.connect(buyer).approve(await marketplace.getAddress(), price);
      await marketplace.connect(buyer).buyItem(0);

      expect(await nft.ownerOf(0)).to.equal(buyer.address);
    });

    it("Should transfer WSP correctly with 1% fee", async function () {
      const price = ethers.parseEther("10");
      const fee = price / 100n;
      const sellerAmount = price - fee;

      const ownerBalBefore = await paymentToken.balanceOf(owner.address);
      const sellerBalBefore = await paymentToken.balanceOf(seller.address);

      await paymentToken.connect(buyer).approve(await marketplace.getAddress(), price);
      await marketplace.connect(buyer).buyItem(0);

      const ownerBalAfter = await paymentToken.balanceOf(owner.address);
      const sellerBalAfter = await paymentToken.balanceOf(seller.address);

      expect(ownerBalAfter - ownerBalBefore).to.equal(fee);
      expect(sellerBalAfter - sellerBalBefore).to.equal(sellerAmount);
    });

    it("Should fail if not approved WSP", async function () {
      await expect(marketplace.connect(buyer).buyItem(0)).to.be.reverted;
    });
  });

  describe("Cancel Listing", function () {
    it("Should cancel listing", async function () {
      const price = ethers.parseEther("10");
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);

      await marketplace.connect(seller).cancelListing(0);

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should fail if not seller", async function () {
      const price = ethers.parseEther("10");
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);

      await expect(marketplace.connect(buyer).cancelListing(0)).to.be.reverted;
    });
  });
});
