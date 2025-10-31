"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

interface NFTData {
  tokenId: number;
  owner: string;
  imageUrl?: string;
  name?: string;
  listing?: {
    price: bigint;
    seller: string;
    active: boolean;
  };
}

export const MarketplaceGrid = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get total supply to know how many NFTs exist
  const { data: totalSupply } = useScaffoldContractRead({
    contractName: "WapsewapNFT",
    functionName: "totalSupply",
  });

  // Fetch all NFT data
  useEffect(() => {
    const fetchNFTs = async () => {
      if (totalSupply === undefined) return;

      setIsLoading(true);
      const nftData: NFTData[] = [];

      // Fetch each NFT's data with metadata
      const promises = Array.from({ length: Number(totalSupply) }, async (_, i) => {
        try {
          // This will be handled by individual NFTCard components
          return {
            tokenId: i,
            owner: "",
            imageUrl: "", // Will be loaded by NFTCard
            name: `NFT #${i}`,
          };
        } catch (error) {
          console.error(`Error creating NFT ${i}:`, error);
          return {
            tokenId: i,
            owner: "",
            imageUrl: "",
            name: `NFT #${i}`,
          };
        }
      });

      const results = await Promise.all(promises);
      nftData.push(...results);

      setNfts(nftData);
      setIsLoading(false);
    };

    fetchNFTs();
  }, [totalSupply, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Simple Controls Row */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-base-content/60">Showing {nfts.length} NFTs</div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleRefresh} title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {/* NFT Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg text-dayak-green-600"></span>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-2xl font-bold mb-2">No NFTs Found</h3>
          <p className="text-base-content/60">Mint your first NFT to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft: NFTData) => (
            <NFTCard key={nft.tokenId} tokenId={nft.tokenId} onAction={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};
