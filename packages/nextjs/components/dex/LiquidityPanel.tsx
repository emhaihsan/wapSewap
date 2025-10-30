"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const LiquidityPanel = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [wspAmount, setWspAmount] = useState("");
  const [susdcAmount, setSusdcAmount] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [isAddMode, setIsAddMode] = useState(true);
  const [lastManualInput, setLastManualInput] = useState<"wsp" | "susdc" | null>(null);

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
    enabled: !!DEX_ADDRESS && !!connectedAddress,
  });

  // Get USDC allowance
  const { data: usdcAllowance } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "allowance",
    args: [connectedAddress, DEX_ADDRESS],
    enabled: !!DEX_ADDRESS && !!connectedAddress,
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
    args: [wspAmount ? parseEther(wspAmount) : 0n, susdcAmount ? parseUnits(susdcAmount, 6) : 0n],
  });

  // Remove liquidity
  const { writeAsync: removeLiquidity, isLoading: isRemovingLiquidity } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "removeLiquidity",
    args: [lpAmount ? parseEther(lpAmount) : 0n],
  });

  const lpBalanceFloat = lpBalance ? Number(formatEther(lpBalance)) : 0;
  const totalLiquidityFloat = totalSupply ? Number(formatEther(totalSupply)) : 0;
  const wspReserveFloat = reserves ? Number(formatEther((reserves as [bigint, bigint])[0])) : 0;
  const susdcReserveFloat = reserves ? Number(formatUnits((reserves as [bigint, bigint])[1], 6)) : 0;
  const poolRatio =
    wspReserveFloat > 0 && susdcReserveFloat > 0
      ? {
          wspPerSusdc: (wspReserveFloat / susdcReserveFloat).toFixed(2),
          susdcPerWsp: (susdcReserveFloat / wspReserveFloat).toFixed(2),
        }
      : null;

  // Calculate user's share percentage
  const userSharePercentage =
    totalLiquidityFloat > 0 ? ((lpBalanceFloat / totalLiquidityFloat) * 100).toFixed(2) : "0.00";

  // Format LP balance for display
  const formattedLpBalance = lpBalanceFloat.toFixed(4);

  useEffect(() => {
    if (!isAddMode || !poolRatio || !reserves) return;
    if (lastManualInput === "wsp") {
      if (!wspAmount) {
        setSusdcAmount("");
        setLastManualInput(null);
        return;
      }
      const ratio = susdcReserveFloat / wspReserveFloat;
      if (!Number.isFinite(ratio) || ratio === 0) {
        setLastManualInput(null);
        return;
      }
      const parsed = Number(wspAmount);
      if (Number.isNaN(parsed)) {
        setLastManualInput(null);
        return;
      }
      const computed = parsed * ratio;
      const formatted = computed.toFixed(6);
      if (formatted !== susdcAmount) {
        setSusdcAmount(formatted);
      }
      setLastManualInput(null);
    } else if (lastManualInput === "susdc") {
      if (!susdcAmount) {
        setWspAmount("");
        setLastManualInput(null);
        return;
      }
      const ratio = wspReserveFloat / susdcReserveFloat;
      if (!Number.isFinite(ratio) || ratio === 0) {
        setLastManualInput(null);
        return;
      }
      const parsed = Number(susdcAmount);
      if (Number.isNaN(parsed)) {
        setLastManualInput(null);
        return;
      }
      const computed = parsed * ratio;
      const formatted = computed.toFixed(6);
      if (formatted !== wspAmount) {
        setWspAmount(formatted);
      }
      setLastManualInput(null);
    }
  }, [isAddMode, poolRatio, lastManualInput, wspAmount, susdcAmount, wspReserveFloat, susdcReserveFloat]);

  const handleAddLiquidity = async () => {
    if (!wspAmount || !susdcAmount || !connectedAddress) return;

    try {
      const wspValue = parseEther(wspAmount);
      const susdcValue = parseUnits(susdcAmount, 6);

      // Check and approve WSP if needed
      if (!wapsAllowance || wapsAllowance < wspValue) {
        notification.info("Approving WSP...");
        await approveWaps();
        notification.success("WSP approved!");
      }

      // Check and approve sUSDC if needed
      if (!usdcAllowance || usdcAllowance < susdcValue) {
        notification.info("Approving sUSDC...");
        await approveUsdc();
        notification.success("sUSDC approved!");
      }

      // Add liquidity
      notification.info("Adding liquidity...");
      await addLiquidity();
      notification.success("Liquidity added successfully!");

      // Reset form
      setWspAmount("");
      setSusdcAmount("");
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
                <span className="label-text">WSP Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={wspAmount}
                onChange={e => {
                  const value = e.target.value;
                  if (value === "" || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                    setWspAmount(value);
                    setLastManualInput("wsp");
                  }
                }}
                min="0"
                step="any"
                disabled={!isConnected}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">sUSDC Amount</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={susdcAmount}
                onChange={e => {
                  const value = e.target.value;
                  if (value === "" || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                    setSusdcAmount(value);
                    setLastManualInput("susdc");
                  }
                }}
                min="0"
                step="any"
                disabled={!isConnected}
              />
              {poolRatio && (
                <p className="mt-2 text-xs text-base-content/60">
                  Pool maintains constant ratio: <span className="font-semibold">{poolRatio.wspPerSusdc} WSP</span> :
                  <span className="font-semibold"> 1 sUSDC</span>. New deposits will be automatically adjusted to follow
                  this ratio.
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
                  disabled={!wspAmount || !susdcAmount || isApprovingWaps || isApprovingUsdc || isAddingLiquidity}
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
                onChange={e => {
                  const value = e.target.value;
                  if (value === "" || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                    setLpAmount(value);
                  }
                }}
                min="0"
                step="any"
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
              WSP: {formatEther((reserves as [bigint, bigint])[0])} | sUSDC:{" "}
              {formatUnits((reserves as [bigint, bigint])[1], 6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
