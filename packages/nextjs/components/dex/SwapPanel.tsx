"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const WAPS_ADDRESS = "0xADb64775Fc297B7D3762c6CB7fA0D41099Cd2d73";
const USDC_ADDRESS = "0x17f5c0cEc8c989566ED3b0f6177CcC69c4429C54";
const DEX_ADDRESS = "0x0d449bF44aa7E077AA583a4fCCF9Fd32C0A510F9";

export const SwapPanel = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isToken0ToToken1, setIsToken0ToToken1] = useState(true); // WAPS -> USDC

  // Get reserves
  const { data: reserves } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getReserves",
  });

  // Get allowance
  const { data: allowance } = useScaffoldContractRead({
    contractName: isToken0ToToken1 ? "WapsewapToken" : "SimpleUSDC",
    functionName: "allowance",
    args: [connectedAddress, DEX_ADDRESS],
  });

  // Approve token
  const { writeAsync: approveToken, isLoading: isApproving } = useScaffoldContractWrite({
    contractName: isToken0ToToken1 ? "WapsewapToken" : "SimpleUSDC",
    functionName: "approve",
    args: [DEX_ADDRESS, parseEther("1000000")], // Approve large amount
  });

  // Swap function
  const { writeAsync: swap, isLoading: isSwapping } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "swap",
    args: [
      isToken0ToToken1 ? WAPS_ADDRESS : USDC_ADDRESS,
      inputAmount ? (isToken0ToToken1 ? parseEther(inputAmount) : parseUnits(inputAmount, 6)) : 0n,
      0n, // amountOutMin - set to 0 for now (no slippage protection)
    ],
  });

  // Calculate output amount preview
  useEffect(() => {
    if (!inputAmount || !reserves) {
      setOutputAmount("");
      return;
    }

    try {
      const input = isToken0ToToken1 ? parseEther(inputAmount) : parseUnits(inputAmount, 6);
      const [reserve0, reserve1] = reserves as [bigint, bigint];

      if (reserve0 === 0n || reserve1 === 0n) {
        setOutputAmount("0");
        return;
      }

      // Calculate output with 0.3% fee
      const inputWithFee = input * 997n;
      const numerator = inputWithFee * (isToken0ToToken1 ? reserve1 : reserve0);
      const denominator = (isToken0ToToken1 ? reserve0 : reserve1) * 1000n + inputWithFee;
      const output = numerator / denominator;

      setOutputAmount(isToken0ToToken1 ? formatUnits(output, 6) : formatEther(output));
    } catch (error) {
      console.error("Error calculating output:", error);
      setOutputAmount("0");
    }
  }, [inputAmount, reserves, isToken0ToToken1]);

  const handleSwap = async () => {
    if (!inputAmount || !connectedAddress) return;

    try {
      const inputValue = isToken0ToToken1 ? parseEther(inputAmount) : parseUnits(inputAmount, 6);

      // Check allowance and approve if needed
      if (!allowance || allowance < inputValue) {
        notification.info("Approving token...");
        await approveToken();
        notification.success("Token approved!");
      }

      // Execute swap
      notification.info("Swapping tokens...");
      await swap();
      notification.success("Swap successful!");

      // Reset form
      setInputAmount("");
      setOutputAmount("");
    } catch (error: any) {
      console.error("Swap error:", error);
      notification.error(error?.message || "Swap failed");
    }
  };

  const handleFlipTokens = () => {
    setIsToken0ToToken1(!isToken0ToToken1);
    setInputAmount("");
    setOutputAmount("");
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-dayak-green-400">Swap Tokens</h2>

        {/* Input Token */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">From</span>
            <span className="label-text-alt">{isToken0ToToken1 ? "WAPS" : "USDC"}</span>
          </label>
          <input
            type="number"
            placeholder="0.0"
            className="input input-bordered w-full"
            value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            disabled={!isConnected}
          />
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleFlipTokens}
            className="btn btn-circle btn-sm bg-dayak-green-900/50 hover:bg-dayak-green-800 border-none"
            disabled={!isConnected}
          >
            ↕️
          </button>
        </div>

        {/* Output Token */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">To (estimated)</span>
            <span className="label-text-alt">{isToken0ToToken1 ? "USDC" : "WAPS"}</span>
          </label>
          <input type="text" placeholder="0.0" className="input input-bordered w-full" value={outputAmount} disabled />
        </div>

        {/* Swap Button */}
        <div className="card-actions justify-end mt-4">
          {!isConnected ? (
            <div className="tooltip tooltip-top w-full" data-tip="Connect wallet to interact">
              <button className="btn btn-primary w-full bg-dayak-green-600 border-none" disabled>
                Connect Wallet
              </button>
            </div>
          ) : !reserves || (reserves as [bigint, bigint])[0] === 0n || (reserves as [bigint, bigint])[1] === 0n ? (
            <div className="tooltip tooltip-top w-full" data-tip="No liquidity in pool. Add liquidity first.">
              <button className="btn btn-primary w-full bg-dayak-green-600 border-none" disabled>
                No Liquidity
              </button>
            </div>
          ) : (
            <button
              onClick={handleSwap}
              className="btn btn-primary w-full bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
              disabled={!inputAmount || isApproving || isSwapping}
            >
              {isApproving ? "Approving..." : isSwapping ? "Swapping..." : "Swap"}
            </button>
          )}
        </div>

        {/* Price Info */}
        {reserves && (
          <div className="text-xs text-base-content/60 mt-2">
            <p>
              Rate: 1 {isToken0ToToken1 ? "WAPS" : "USDC"} ≈{" "}
              {isToken0ToToken1
                ? (
                    Number(formatUnits((reserves as [bigint, bigint])[1], 6)) /
                    Number(formatEther((reserves as [bigint, bigint])[0]))
                  ).toFixed(6)
                : (
                    Number(formatEther((reserves as [bigint, bigint])[0])) /
                    Number(formatUnits((reserves as [bigint, bigint])[1], 6))
                  ).toFixed(6)}{" "}
              {isToken0ToToken1 ? "USDC" : "WAPS"}
            </p>
            <p className="mt-1">Fee: 0.3%</p>
          </div>
        )}
      </div>
    </div>
  );
};
