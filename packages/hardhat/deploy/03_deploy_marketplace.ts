import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMarketplace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("🚀 Deploying NFTMarketplace with deployer:", deployer);

  // Get contract addresses
  const wapsewapNFT = await get("WapsewapNFT");
  const wapsewapToken = await get("WapsewapToken");

  const marketplace = await deploy("NFTMarketplace", {
    from: deployer,
    args: [wapsewapNFT.address, wapsewapToken.address, deployer], // NFT contract, payment token (WSP), fee recipient
    log: true,
    autoMine: true,
  });

  console.log("✅ NFTMarketplace deployed:");
  console.log("  Marketplace:", marketplace.address);
  console.log("  NFT Contract:", wapsewapNFT.address);
  console.log("  Payment Token (WSP):", wapsewapToken.address);
  console.log("  Fee Recipient:", deployer);
  console.log("  Fee Rate: 1% (immutable)");
};

export default deployMarketplace;
deployMarketplace.tags = ["marketplace"];
deployMarketplace.dependencies = ["tokens"];
