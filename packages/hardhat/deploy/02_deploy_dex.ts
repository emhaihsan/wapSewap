import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployDEX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { get } = hre.deployments;

  console.log("🚀 Creating WSP/sUSDC pair via Factory...");

  // Get deployed contracts
  const wapsewapToken = await get("WapsewapToken");
  const simpleUSDC = await get("SimpleUSDC");
  const factory = await get("DEXFactory");

  // Get factory contract instance
  const factoryContract = await hre.ethers.getContractAt("DEXFactory", factory.address);

  // Create WSP/sUSDC pair
  const tx = await factoryContract.createPair(wapsewapToken.address, simpleUSDC.address);
  await tx.wait();

  // Get pair address directly from mapping (no event parsing needed)
  const pairAddress = await factoryContract.getPair(wapsewapToken.address, simpleUSDC.address);

  if (!pairAddress || pairAddress === hre.ethers.ZeroAddress) {
    throw new Error("Failed to create pair");
  }

  console.log("✅ WSP/sUSDC DEX pair created:");
  console.log("  Pair address:", pairAddress);
  console.log("  Token0 (WSP):", wapsewapToken.address);
  console.log("  Token1 (sUSDC):", simpleUSDC.address);

  // Save pair address for frontend
  const deployments = hre.deployments;
  await deployments.save("SimpleDEX", {
    address: pairAddress,
    abi: (await hre.artifacts.readArtifact("SimpleDEX")).abi,
  });
};

export default deployDEX;
deployDEX.tags = ["dex"];
deployDEX.dependencies = ["factory"];
