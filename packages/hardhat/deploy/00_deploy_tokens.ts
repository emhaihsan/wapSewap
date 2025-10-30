import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTokens: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying tokens with deployer:", deployer);

  // Deploy WapsewapToken
  const wapsewapToken = await deploy("WapsewapToken", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy SimpleUSDC
  const simpleUSDC = await deploy("SimpleUSDC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy WapsewapNFT
  const wapsewapNFT = await deploy("WapsewapNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ Tokens deployed:");
  console.log("  WapsewapToken:", wapsewapToken.address);
  console.log("  SimpleUSDC:", simpleUSDC.address);
  console.log("  WapsewapNFT:", wapsewapNFT.address);
};

export default deployTokens;
deployTokens.tags = ["tokens"];
