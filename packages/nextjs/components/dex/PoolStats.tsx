"use client";

import { formatEther, formatUnits } from "viem";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const PoolStats = () => {
  // Get reserves
  const { data: reserves } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getReserves",
  });

  // Get total liquidity
  const { data: totalSupply } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "totalLiquidity",
  });

  // Calculate price ratio
  const priceRatio =
    reserves && (reserves as [bigint, bigint])[0] > 0n
      ? (
          Number(formatUnits((reserves as [bigint, bigint])[1], 6)) /
          Number(formatEther((reserves as [bigint, bigint])[0]))
        ).toFixed(6)
      : "0.000000";

  const totalLiquidityFormatted = totalSupply ? Number(formatEther(totalSupply)).toFixed(4) : "0.0000";

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-dayak-green-400">Pool Statistics</h2>

        <div className="stats stats-vertical shadow bg-base-300">
          <div className="stat">
            <div className="stat-title">WAPS Reserve</div>
            <div className="stat-value text-2xl text-dayak-green-400">
              {reserves ? formatEther((reserves as [bigint, bigint])[0]) : "0.0"}
            </div>
            <div className="stat-desc">Wapsewap Token</div>
          </div>

          <div className="stat">
            <div className="stat-title">USDC Reserve</div>
            <div className="stat-value text-2xl text-dayak-green-400">
              {reserves ? formatUnits((reserves as [bigint, bigint])[1], 6) : "0.0"}
            </div>
            <div className="stat-desc">Simple USDC</div>
          </div>

          <div className="stat">
            <div className="stat-title">Price Ratio</div>
            <div className="stat-value text-2xl text-dayak-green-400">1 WAPS = {priceRatio} USDC</div>
            <div className="stat-desc">Current exchange rate</div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Liquidity</div>
            <div className="stat-value text-2xl text-dayak-green-400">{totalLiquidityFormatted}</div>
            <div className="stat-desc">Total liquidity in pool (WAPS equivalent)</div>
          </div>
        </div>

        <div className="alert alert-info mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm">Trading fee: 0.3% | Fees are distributed to liquidity providers</span>
        </div>
      </div>
    </div>
  );
};
