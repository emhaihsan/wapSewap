import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying DEXFactory with deployer:", deployer);

  const factory = await deploy("DEXFactory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ DEXFactory deployed:", factory.address);
};

export default deployFactory;
deployFactory.tags = ["factory"];
deployFactory.dependencies = ["tokens"];
