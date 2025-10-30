"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface NFTCardProps {
  tokenId: number;
  imageUrl?: string;
  onAction?: () => void;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const NFTCard = ({ tokenId, imageUrl, onAction }: NFTCardProps) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState("");
  const [usdPrice, setUsdPrice] = useState("0.00");
  const [wspApproved, setWspApproved] = useState(false);
  const [nftName, setNftName] = useState(`NFT #${tokenId}`);
  const [nftImageUrl, setNftImageUrl] = useState(imageUrl || "");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const { data: marketplaceInfo } = useDeployedContractInfo("NFTMarketplace");
  const marketplaceAddress = marketplaceInfo?.address ?? ZERO_ADDRESS;

  // Get tokenURI
  const { data: tokenURI } = useScaffoldContractRead({
    contractName: "WapsewapNFT",
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  // Fetch metadata from tokenURI
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenURI) return;

      try {
        const response = await fetch(tokenURI as string);
        if (!response.ok) throw new Error("Failed to fetch metadata");

        const metadata = await response.json();
        setNftName(metadata.name || `NFT #${tokenId}`);
        setNftImageUrl(metadata.image || "");
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
        setNftName(`NFT #${tokenId}`);
        setNftImageUrl("");
      }
    };

    fetchMetadata();
  }, [tokenURI, tokenId]);

  // Get NFT owner
  const { data: owner } = useScaffoldContractRead({
    contractName: "WapsewapNFT",
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  // Get listing info
  const { data: listing } = useScaffoldContractRead({
    contractName: "NFTMarketplace",
    functionName: "listings",
    args: [BigInt(tokenId)],
  });

  // Get NFT approval status
  const { data: approvedAddress } = useScaffoldContractRead({
    contractName: "WapsewapNFT",
    functionName: "getApproved",
    args: [BigInt(tokenId)],
  });

  // Get WSP balance
  const { data: wspBalance } = useScaffoldContractRead({
    contractName: "WapsewapToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Get WSP allowance for marketplace
  const { data: wspAllowance, refetch: refetchWspAllowance } = useScaffoldContractRead({
    contractName: "WapsewapToken",
    functionName: "allowance",
    args: [connectedAddress, marketplaceAddress],
  });

  // Get DEX reserves to calculate WSP/sUSDC rate
  const { data: reserves } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getReserves",
  });

  const isOwner = owner?.toLowerCase() === connectedAddress?.toLowerCase();
  const isApproved = marketplaceAddress ? approvedAddress?.toLowerCase() === marketplaceAddress.toLowerCase() : false;
  const isListed = listing && (listing as any)[3]; // active field
  const listingPrice = listing ? (listing as any)[2] : 0n; // price field
  const listingSeller = listing ? (listing as any)[1] : null; // seller field
  const hasEnoughWSP = wspBalance ? wspBalance >= listingPrice : false;
  const wspAllowanceEnough = wspAllowance ? wspAllowance >= listingPrice : false;

  // Calculate sUSDC equivalent price using DEX rate
  const calculateSusdcPrice = (wspAmount: string) => {
    if (!wspAmount || !reserves) return "0.00";
    try {
      const wspValue = parseFloat(wspAmount);
      const [wspReserve, susdcReserve] = reserves as [bigint, bigint];
      
      if (wspReserve === 0n || susdcReserve === 0n) return "0.00";
      
      // Calculate WSP to sUSDC rate: sUSDC_reserve / WSP_reserve
      const wspReserveFloat = Number(formatEther(wspReserve));
      const susdcReserveFloat = Number(formatUnits(susdcReserve, 6));
      const rate = susdcReserveFloat / wspReserveFloat;
      
      return (wspValue * rate).toFixed(2);
    } catch {
      return "0.00";
    }
  };

  // Update sUSDC price when WSP price changes
  const handlePriceChange = (value: string) => {
    setListPrice(value);
    setUsdPrice(calculateSusdcPrice(value));
  };

  // Approve marketplace
  const { writeAsync: approve, isLoading: isApproving } = useScaffoldContractWrite({
    contractName: "WapsewapNFT",
    functionName: "approve",
    args: [marketplaceAddress, BigInt(tokenId)],
  });

  // List item
  const { writeAsync: listItem, isLoading: isListing } = useScaffoldContractWrite({
    contractName: "NFTMarketplace",
    functionName: "listItem",
    args: [BigInt(tokenId), listPrice ? parseEther(listPrice) : 0n],
  });

  // Approve WSP for marketplace
  const { writeAsync: approveWSP, isLoading: isApprovingWSP } = useScaffoldContractWrite({
    contractName: "WapsewapToken",
    functionName: "approve",
    args: [marketplaceAddress, listingPrice],
  });

  // Buy item (no value needed, uses WSP)
  const { writeAsync: buyItem, isLoading: isBuying } = useScaffoldContractWrite({
    contractName: "NFTMarketplace",
    functionName: "buyItem",
    args: [BigInt(tokenId)],
  });

  // Cancel listing
  const { writeAsync: cancelListing, isLoading: isCanceling } = useScaffoldContractWrite({
    contractName: "NFTMarketplace",
    functionName: "cancelListing",
    args: [BigInt(tokenId)],
  });

  const handleApprove = async () => {
    try {
      await approve();
      notification.success("NFT approved for marketplace!");
      onAction?.();
    } catch (error: any) {
      console.error("Approve error:", error);
      notification.error(error?.message || "Failed to approve");
    }
  };

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      notification.error("Please enter a valid price");
      return;
    }

    try {
      await listItem();
      notification.success("NFT listed successfully!");
      setShowListModal(false);
      setListPrice("");
      onAction?.();
    } catch (error: any) {
      console.error("List error:", error);
      notification.error(error?.message || "Failed to list NFT");
    }
  };

  const handleApproveWSP = async () => {
    try {
      await approveWSP();
      notification.success("WSP approved for marketplace!");
      setTimeout(() => refetchWspAllowance(), 2000);
    } catch (error: any) {
      console.error("Approve WSP error:", error);
      notification.error(error?.message || "Failed to approve WSP");
    }
  };

  const handleBuy = async () => {
    if (!hasEnoughWSP) {
      notification.error("Insufficient WSP balance");
      return;
    }

    if (!wspAllowanceEnough) {
      notification.info("Please approve WSP first");
      return;
    }

    try {
      await buyItem();
      notification.success("NFT purchased successfully!");
      onAction?.();
    } catch (error: any) {
      console.error("Buy error:", error);
      notification.error(error?.message || "Failed to buy NFT");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelListing();
      notification.success("Listing canceled successfully!");
      onAction?.();
    } catch (error: any) {
      console.error("Cancel error:", error);
      notification.error(error?.message || "Failed to cancel listing");
    }
  };

  const openListModal = () => {
    if (!isApproved) {
      notification.info("Please approve marketplace first");
      return;
    }
    setShowListModal(true);
  };

  return (
    <>
      <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
        <figure className="px-4 pt-4">
          <div className="relative w-full aspect-square bg-base-300 rounded-xl overflow-hidden">
            {nftImageUrl ? (
              <img src={nftImageUrl} alt={nftName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/30">
                <span className="text-4xl">#{tokenId}</span>
              </div>
            )}
            {isListed && <div className="absolute top-2 right-2 badge badge-success badge-sm">Listed</div>}
          </div>
        </figure>

        <div className="card-body p-4">
          <h3 className="card-title text-lg">{nftName}</h3>

          {isListed && (
            <div className="text-sm">
              <div className="font-semibold text-dayak-green-400">{formatEther(listingPrice)} WSP</div>
              <div className="text-xs text-base-content/60">≈ {calculateSusdcPrice(formatEther(listingPrice))} sUSDC</div>
            </div>
          )}

          <div className="text-xs text-base-content/60">
            Owner: {isOwner ? "You" : `${owner?.slice(0, 6)}...${owner?.slice(-4)}`}
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-end mt-2">
            {!isConnected ? (
              <div className="tooltip tooltip-top w-full" data-tip="Connect wallet to interact">
                <button className="btn btn-sm btn-primary w-full" disabled>
                  Connect Wallet
                </button>
              </div>
            ) : isOwner ? (
              <>
                {!isListed ? (
                  <>
                    {!isApproved ? (
                      <button
                        onClick={handleApprove}
                        className="btn btn-sm btn-secondary w-full"
                        disabled={isApproving}
                      >
                        {isApproving ? "Approving..." : "Approve"}
                      </button>
                    ) : (
                      <button
                        onClick={openListModal}
                        className="btn btn-sm btn-primary w-full bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                      >
                        List for Sale
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={handleCancel} className="btn btn-sm btn-error w-full" disabled={isCanceling}>
                    {isCanceling ? "Canceling..." : "Cancel Listing"}
                  </button>
                )}
              </>
            ) : isListed ? (
              <>
                {!hasEnoughWSP ? (
                  <div className="tooltip tooltip-top w-full" data-tip="Insufficient WSP balance">
                    <button className="btn btn-sm btn-error w-full" disabled>
                      Insufficient WSP
                    </button>
                  </div>
                ) : !wspAllowanceEnough ? (
                  <button
                    onClick={handleApproveWSP}
                    className="btn btn-sm btn-secondary w-full"
                    disabled={isApprovingWSP}
                  >
                    {isApprovingWSP ? "Approving..." : "Approve WSP"}
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    className="btn btn-sm btn-primary w-full bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                    disabled={isBuying}
                  >
                    {isBuying ? "Buying..." : "Buy Now"}
                  </button>
                )}
              </>
            ) : (
              <button className="btn btn-sm w-full" disabled>
                Not for Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List Modal */}
      {showListModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">List NFT #{tokenId}</h3>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Price (WSP)</span>
                <span className="label-text-alt text-dayak-green-400">≈ {usdPrice} sUSDC</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={listPrice}
                onChange={e => handlePriceChange(e.target.value)}
              />
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
              <span className="text-xs">Marketplace fee: 1% will be deducted from sale price</span>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowListModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                onClick={handleList}
                disabled={isListing || !listPrice || parseFloat(listPrice) <= 0}
              >
                {isListing ? "Listing..." : "List NFT"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowListModal(false)}></div>
        </div>
      )}
    </>
  );
};
