"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const TokenFaucet = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [wspCooldown, setWspCooldown] = useState<number>(0);
  const [usdcCooldown, setUsdcCooldown] = useState<number>(0);

  // Read faucet info for WSP
  const { data: wspFaucetInfo } = useScaffoldContractRead({
    contractName: "WapsewapToken",
    functionName: "getFaucetInfo",
    args: [connectedAddress],
    enabled: !!connectedAddress,
  });

  // Read faucet info for sUSDC
  const { data: usdcFaucetInfo } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "getFaucetInfo",
    args: [connectedAddress],
    enabled: !!connectedAddress,
  });

  // WSP Faucet
  const { writeAsync: claimWSP, isLoading: isClaimingWSP } = useScaffoldContractWrite({
    contractName: "WapsewapToken",
    functionName: "faucet",
  });

  // sUSDC Faucet
  const { writeAsync: claimUSDC, isLoading: isClaimingUSDC } = useScaffoldContractWrite({
    contractName: "SimpleUSDC",
    functionName: "faucet",
  });

  // Update cooldowns
  useEffect(() => {
    const updateCooldowns = () => {
      const now = Math.floor(Date.now() / 1000);
      
      if (wspFaucetInfo) {
        const wspNext = Number(wspFaucetInfo[0]);
        setWspCooldown(Math.max(0, wspNext - now));
      }
      
      if (usdcFaucetInfo) {
        const usdcNext = Number(usdcFaucetInfo[0]);
        setUsdcCooldown(Math.max(0, usdcNext - now));
      }
    };

    updateCooldowns();
    const interval = setInterval(updateCooldowns, 1000);
    return () => clearInterval(interval);
  }, [wspFaucetInfo, usdcFaucetInfo]);

  const handleClaimWSP = async () => {
    try {
      await claimWSP();
      notification.success("Successfully claimed 100 WSP!");
    } catch (error: any) {
      console.error("WSP claim error:", error);
      notification.error(error?.message || "Failed to claim WSP");
    }
  };

  const handleClaimUSDC = async () => {
    try {
      await claimUSDC();
      notification.success("Successfully claimed 50 sUSDC!");
    } catch (error: any) {
      console.error("sUSDC claim error:", error);
      notification.error(error?.message || "Failed to claim sUSDC");
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Ready!";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 border border-dayak-green-900/30">
        <div className="card-body">
          <h3 className="card-title text-dayak-green-400">🚰 Token Faucet</h3>
          <p className="text-base-content/70 text-sm">
            Connect your wallet to claim test tokens for DEX trading.
          </p>
          <div className="text-center py-4">
            <button className="btn btn-sm btn-disabled" disabled>
              Connect Wallet First
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 border border-dayak-green-900/30">
      <div className="card-body">
        <h3 className="card-title text-dayak-green-400">🚰 Token Faucet</h3>
        <p className="text-base-content/70 text-sm mb-4">
          Claim test tokens to start trading on the DEX. Each faucet has a 24-hour cooldown.
        </p>

        {/* WSP Faucet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-base-300/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dayak-green-600 flex items-center justify-center text-white text-xs font-bold">
                WSP
              </div>
              <div>
                <div className="font-medium">WapsewapToken</div>
                <div className="text-xs text-base-content/60">100 WSP per claim</div>
              </div>
            </div>
            <div className="text-right">
              {wspCooldown > 0 ? (
                <div className="text-xs text-base-content/60">
                  Next: {formatTime(wspCooldown)}
                </div>
              ) : (
                <button
                  className="btn btn-xs btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                  onClick={handleClaimWSP}
                  disabled={isClaimingWSP}
                >
                  {isClaimingWSP ? "Claiming..." : "Claim"}
                </button>
              )}
            </div>
          </div>

          {/* sUSDC Faucet */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-base-300/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                sUSDC
              </div>
              <div>
                <div className="font-medium">SimpleUSDC</div>
                <div className="text-xs text-base-content/60">50 sUSDC per claim</div>
              </div>
            </div>
            <div className="text-right">
              {usdcCooldown > 0 ? (
                <div className="text-xs text-base-content/60">
                  Next: {formatTime(usdcCooldown)}
                </div>
              ) : (
                <button
                  className="btn btn-xs btn-primary bg-blue-600 hover:bg-blue-700 border-none"
                  onClick={handleClaimUSDC}
                  disabled={isClaimingUSDC}
                >
                  {isClaimingUSDC ? "Claiming..." : "Claim"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-xs">
            These are testnet tokens with no real value. Use them to test DEX functionality.
          </span>
        </div>
      </div>
    </div>
  );
};
