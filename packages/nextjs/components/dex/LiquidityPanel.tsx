"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export const LiquidityPanel = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [wapsAmount, setWapsAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [isAddMode, setIsAddMode] = useState(true);
  const [lastManualInput, setLastManualInput] = useState<"waps" | "usdc" | null>(null);

  // Get deployed contract address
  const { data: dexContract } = useDeployedContractInfo("SimpleDEX");
  const DEX_ADDRESS = dexContract?.address;

  // Get reserves
  const { data: reserves } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getReserves",
  });

  // Get user liquidity
  const { data: lpBalance } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getUserLiquidity",
    args: [connectedAddress],
  });

  // Get total liquidity
  const { data: totalSupply } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "totalLiquidity",
  });

  // Get WAPS allowance
  const { data: wapsAllowance } = useScaffoldContractRead({
    contractName: "WapsewapToken",
    functionName: "allowance",
    args: [connectedAddress, DEX_ADDRESS],
  });

  // Get USDC allowance
  const { data: usdcAllowance } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "allowance",
    args: [connectedAddress, DEX_ADDRESS],
  });

  // Approve WAPS
  const { writeAsync: approveWaps, isLoading: isApprovingWaps } = useScaffoldContractWrite({
    contractName: "WapsewapToken",
    functionName: "approve",
    args: [DEX_ADDRESS, parseEther("1000000")],
  });

  // Approve USDC
  const { writeAsync: approveUsdc, isLoading: isApprovingUsdc } = useScaffoldContractWrite({
    contractName: "SimpleUSDC",
    functionName: "approve",
    args: [DEX_ADDRESS, parseUnits("1000000", 6)],
  });

  // Add liquidity
  const { writeAsync: addLiquidity, isLoading: isAddingLiquidity } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "addLiquidity",
    args: [wapsAmount ? parseEther(wapsAmount) : 0n, usdcAmount ? parseUnits(usdcAmount, 6) : 0n],
  });

  // Remove liquidity
  const { writeAsync: removeLiquidity, isLoading: isRemovingLiquidity } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "removeLiquidity",
    args: [lpAmount ? parseEther(lpAmount) : 0n],
  });

  const lpBalanceFloat = lpBalance ? Number(formatEther(lpBalance)) : 0;
  const totalLiquidityFloat = totalSupply ? Number(formatEther(totalSupply)) : 0;
  const wapsReserveFloat = reserves ? Number(formatEther((reserves as [bigint, bigint])[0])) : 0;
  const usdcReserveFloat = reserves ? Number(formatUnits((reserves as [bigint, bigint])[1], 6)) : 0;
  const poolRatio =
    wapsReserveFloat > 0 && usdcReserveFloat > 0
      ? {
          wapsPerUsdc: (wapsReserveFloat / usdcReserveFloat).toFixed(2),
          usdcPerWaps: (usdcReserveFloat / wapsReserveFloat).toFixed(2),
        }
      : null;

  // Calculate user's share percentage
  const userSharePercentage =
    totalLiquidityFloat > 0 ? ((lpBalanceFloat / totalLiquidityFloat) * 100).toFixed(2) : "0.00";

  // Format LP balance for display
  const formattedLpBalance = lpBalanceFloat.toFixed(4);

  useEffect(() => {
    if (!isAddMode || !poolRatio || !reserves) return;
    if (lastManualInput === "waps") {
      if (!wapsAmount) {
        setUsdcAmount("");
        setLastManualInput(null);
        return;
      }
      const ratio = usdcReserveFloat / wapsReserveFloat;
      if (!Number.isFinite(ratio) || ratio === 0) {
        setLastManualInput(null);
        return;
      }
      const parsed = Number(wapsAmount);
      if (Number.isNaN(parsed)) {
        setLastManualInput(null);
        return;
      }
      const computed = parsed * ratio;
      const formatted = computed.toFixed(6);
      if (formatted !== usdcAmount) {
        setUsdcAmount(formatted);
      }
      setLastManualInput(null);
    } else if (lastManualInput === "usdc") {
      if (!usdcAmount) {
        setWapsAmount("");
        setLastManualInput(null);
        return;
      }
      const ratio = wapsReserveFloat / usdcReserveFloat;
      if (!Number.isFinite(ratio) || ratio === 0) {
        setLastManualInput(null);
        return;
      }
      const parsed = Number(usdcAmount);
      if (Number.isNaN(parsed)) {
        setLastManualInput(null);
        return;
      }
      const computed = parsed * ratio;
      const formatted = computed.toFixed(6);
      if (formatted !== wapsAmount) {
        setWapsAmount(formatted);
      }
      setLastManualInput(null);
    }
  }, [isAddMode, poolRatio, lastManualInput, wapsAmount, usdcAmount, wapsReserveFloat, usdcReserveFloat]);

  const handleAddLiquidity = async () => {
    if (!wapsAmount || !usdcAmount || !connectedAddress) return;

    try {
      const wapsValue = parseEther(wapsAmount);
      const usdcValue = parseUnits(usdcAmount, 6);

      // Check and approve WAPS if needed
      if (!wapsAllowance || wapsAllowance < wapsValue) {
        notification.info("Approving WAPS...");
        await approveWaps();
        notification.success("WAPS approved!");
      }

      // Check and approve USDC if needed
      if (!usdcAllowance || usdcAllowance < usdcValue) {
        notification.info("Approving USDC...");
        await approveUsdc();
        notification.success("USDC approved!");
      }

      // Add liquidity
      notification.info("Adding liquidity...");
      await addLiquidity();
      notification.success("Liquidity added successfully!");

      // Reset form
      setWapsAmount("");
      setUsdcAmount("");
    } catch (error: any) {
      console.error("Add liquidity error:", error);
      notification.error(error?.message || "Failed to add liquidity");
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!lpAmount || !connectedAddress) return;

    try {
      notification.info("Removing liquidity...");
      await removeLiquidity();
      notification.success("Liquidity removed successfully!");

      // Reset form
      setLpAmount("");
    } catch (error: any) {
      console.error("Remove liquidity error:", error);
      notification.error(error?.message || "Failed to remove liquidity");
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-dayak-green-400">Liquidity</h2>
          <div className="tabs tabs-boxed bg-base-300">
            <a className={`tab ${isAddMode ? "tab-active" : ""}`} onClick={() => setIsAddMode(true)}>
              Add
            </a>
            <a className={`tab ${!isAddMode ? "tab-active" : ""}`} onClick={() => setIsAddMode(false)}>
              Remove
            </a>
          </div>
        </div>

        {isAddMode ? (
          <>
            {/* Add Liquidity Form */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">WAPS Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={wapsAmount}
                onChange={e => {
                  setWapsAmount(e.target.value);
                  setLastManualInput("waps");
                }}
                disabled={!isConnected}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">USDC Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={usdcAmount}
                onChange={e => {
                  setUsdcAmount(e.target.value);
                  setLastManualInput("usdc");
                }}
                disabled={!isConnected}
              />
              {poolRatio && (
                <p className="mt-2 text-xs text-base-content/60">
                  Pool keeps a constant ratio: <span className="font-semibold">{poolRatio.wapsPerUsdc} WAPS</span> :
                  <span className="font-semibold"> 1 USDC</span>. Setoran baru akan otomatis dipotong agar mengikuti
                  rasio ini.
                </p>
              )}
            </div>

            <div className="card-actions justify-end mt-4">
              {!isConnected ? (
                <div className="tooltip tooltip-top w-full" data-tip="Connect wallet to interact">
                  <button className="btn btn-primary w-full bg-dayak-green-600 border-none" disabled>
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddLiquidity}
                  className="btn btn-primary w-full bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                  disabled={!wapsAmount || !usdcAmount || isApprovingWaps || isApprovingUsdc || isAddingLiquidity}
                >
                  {isApprovingWaps || isApprovingUsdc
                    ? "Approving..."
                    : isAddingLiquidity
                    ? "Adding..."
                    : "Add Liquidity"}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Remove Liquidity Form */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Liquidity to Remove</span>
                <span className="label-text-alt">Balance: {formattedLpBalance}</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={lpAmount}
                onChange={e => setLpAmount(e.target.value)}
                disabled={!isConnected}
              />
            </div>

            <div className="card-actions justify-end mt-4">
              {!isConnected ? (
                <div className="tooltip tooltip-top w-full" data-tip="Connect wallet to interact">
                  <button className="btn btn-primary w-full bg-dayak-green-600 border-none" disabled>
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRemoveLiquidity}
                  className="btn btn-primary w-full bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                  disabled={!lpAmount || isRemovingLiquidity}
                >
                  {isRemovingLiquidity ? "Removing..." : "Remove Liquidity"}
                </button>
              )}
            </div>
          </>
        )}

        {/* User Stats */}
        {isConnected && (
          <div className="mt-4 p-4 bg-base-300 rounded-lg">
            <div className="text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-base-content/60">Your Liquidity:</span>
                <span className="font-semibold">{formattedLpBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Your Pool Share:</span>
                <span className="font-semibold text-dayak-green-400">{userSharePercentage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Pool Info */}
        {reserves && (
          <div className="text-xs text-base-content/60 mt-2">
            <p>Pool Reserves:</p>
            <p className="mt-1">
              WAPS: {formatEther((reserves as [bigint, bigint])[0])} | USDC:{" "}
              {formatUnits((reserves as [bigint, bigint])[1], 6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
