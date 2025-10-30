import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarketplace", function () {
  let marketplace: any;
  let nft: any;
  let owner: any, seller: any, buyer: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy NFT
    const NFTFactory = await ethers.getContractFactory("WapsewapNFT");
    nft = await NFTFactory.deploy();
    await nft.waitForDeployment();

    // Deploy Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await MarketplaceFactory.deploy(await nft.getAddress(), owner.address);
    await marketplace.waitForDeployment();

    // Mint NFT to seller
    await nft.mint(seller.address);
  });

  describe("Deployment", function () {
    it("Should set correct NFT contract and fee recipient", async function () {
      expect(await marketplace.nft()).to.equal(await nft.getAddress());
      expect(await marketplace.feeRecipient()).to.equal(owner.address);
    });

    it("Should have 1% fee (100 basis points)", async function () {
      expect(await marketplace.FEE_BPS()).to.equal(100);
      expect(await marketplace.BPS()).to.equal(10000);
    });
  });

  describe("Listing", function () {
    it("Should list NFT for sale", async function () {
      const price = ethers.parseEther("1");

      await nft.connect(seller).approve(await marketplace.getAddress(), 0);

      await expect(marketplace.connect(seller).listItem(0, price))
        .to.emit(marketplace, "ItemListed")
        .withArgs(0, seller.address, price);

      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should fail if not owner", async function () {
      const price = ethers.parseEther("1");

      await expect(marketplace.connect(buyer).listItem(0, price)).to.be.revertedWith("Not owner");
    });

    it("Should fail if not approved", async function () {
      const price = ethers.parseEther("1");

      await expect(marketplace.connect(seller).listItem(0, price)).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail with zero price", async function () {
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);

      await expect(marketplace.connect(seller).listItem(0, 0)).to.be.revertedWith("Price must be > 0");
    });
  });

  describe("Buying", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("1");
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);
    });

    it("Should buy NFT and transfer ownership", async function () {
      const price = ethers.parseEther("1");

      await expect(marketplace.connect(buyer).buyItem(0, { value: price }))
        .to.emit(marketplace, "ItemSold")
        .withArgs(0, seller.address, buyer.address, price);

      expect(await nft.ownerOf(0)).to.equal(buyer.address);

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should charge 1% fee to deployer", async function () {
      const price = ethers.parseEther("1");
      const expectedFee = price / 100n; // 1%
      const expectedSellerAmount = price - expectedFee;

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await marketplace.connect(buyer).buyItem(0, { value: price });

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(expectedFee);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedSellerAmount);
    });

    it("Should refund overpayment", async function () {
      const price = ethers.parseEther("1");
      const overpayment = ethers.parseEther("1.5");

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).buyItem(0, { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      // Should only pay the listing price + gas
      const gasUsedNumber = Number(gasUsed);
      expect(Number(buyerBalanceBefore - buyerBalanceAfter)).to.be.closeTo(
        Number(price) + gasUsedNumber,
        0.01, // in ETH, as number
      );
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.5");

      await expect(marketplace.connect(buyer).buyItem(0, { value: insufficientPayment })).to.be.revertedWith(
        "Insufficient payment",
      );
    });

    it("Should fail if not for sale", async function () {
      // Cancel listing first
      await marketplace.connect(seller).cancelListing(0);

      await expect(marketplace.connect(buyer).buyItem(0, { value: ethers.parseEther("1") })).to.be.revertedWith(
        "Not for sale",
      );
    });
  });

  describe("Cancel Listing", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("1");
      await nft.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listItem(0, price);
    });

    it("Should cancel listing", async function () {
      await expect(marketplace.connect(seller).cancelListing(0))
        .to.emit(marketplace, "ItemCanceled")
        .withArgs(0, seller.address);

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should fail if not seller", async function () {
      await expect(marketplace.connect(buyer).cancelListing(0)).to.be.revertedWith("Not seller");
    });

    it("Should fail if not listed", async function () {
      await marketplace.connect(seller).cancelListing(0);

      await expect(marketplace.connect(seller).cancelListing(0)).to.be.revertedWith("Not listed");
    });
  });
});
