import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployPriceFeed: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying PriceFeed with deployer:", deployer);

  const priceFeed = await deploy("PriceFeed", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: 2,
  });

  console.log("✅ PriceFeed deployed:");
  console.log("  PriceFeed:", priceFeed.address);
  console.log("  Oracle: RedStone (ETH/USD)");
  console.log("  Tolerance: ±15 minutes");
};

export default deployPriceFeed;
deployPriceFeed.tags = ["pricefeed"];
