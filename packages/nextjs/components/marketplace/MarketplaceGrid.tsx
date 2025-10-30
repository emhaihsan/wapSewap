"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

type SortOption = "price-asc" | "price-desc" | "id-asc" | "id-desc" | "newest";
type FilterOption = "all" | "my-nfts" | "active" | "not-listed";

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
  const { address: connectedAddress } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFTData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
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

  // Apply filters and sorting
  useEffect(() => {
    let result = [...nfts];

    // Apply filters
    if (filterBy === "my-nfts" && connectedAddress) {
      result = result.filter(nft => nft.owner.toLowerCase() === connectedAddress.toLowerCase());
    } else if (filterBy === "active") {
      result = result.filter(nft => nft.listing?.active);
    } else if (filterBy === "not-listed") {
      result = result.filter(nft => !nft.listing?.active);
    }

    // Apply price range filter
    if (priceMin || priceMax) {
      result = result.filter(nft => {
        if (!nft.listing?.active) return false;
        const price = Number(nft.listing.price) / 1e18;
        const min = priceMin ? parseFloat(priceMin) : 0;
        const max = priceMax ? parseFloat(priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          if (!a.listing?.active) return 1;
          if (!b.listing?.active) return -1;
          return Number(a.listing.price) - Number(b.listing.price);
        case "price-desc":
          if (!a.listing?.active) return 1;
          if (!b.listing?.active) return -1;
          return Number(b.listing.price) - Number(a.listing.price);
        case "id-desc":
          return b.tokenId - a.tokenId;
        case "newest":
          return b.tokenId - a.tokenId; // Assuming higher ID = newer
        case "id-asc":
        default:
          return a.tokenId - b.tokenId;
      }
    });

    setFilteredNfts(result);
  }, [nfts, sortBy, filterBy, priceMin, priceMax, connectedAddress]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Filter and Sort Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${filterBy === "all" ? "btn-primary bg-dayak-green-600" : "btn-ghost"}`}
              onClick={() => setFilterBy("all")}
            >
              All NFTs
            </button>
            <button
              className={`btn btn-sm ${filterBy === "my-nfts" ? "btn-primary bg-dayak-green-600" : "btn-ghost"}`}
              onClick={() => setFilterBy("my-nfts")}
            >
              My NFTs
            </button>
            <button
              className={`btn btn-sm ${filterBy === "active" ? "btn-primary bg-dayak-green-600" : "btn-ghost"}`}
              onClick={() => setFilterBy("active")}
            >
              Listed
            </button>
            <button
              className={`btn btn-sm ${filterBy === "not-listed" ? "btn-primary bg-dayak-green-600" : "btn-ghost"}`}
              onClick={() => setFilterBy("not-listed")}
            >
              Not Listed
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2 items-center ml-auto">
            <label className="text-sm text-base-content/60">Sort by:</label>
            <select
              className="select select-sm select-bordered"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
            >
              <option value="id-asc">ID (Low to High)</option>
              <option value="id-desc">ID (High to Low)</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={handleRefresh} title="Refresh">
              🔄
            </button>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-base-content/60">Price range (WSP):</span>
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            className="input input-sm input-bordered w-24"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            className="input input-sm input-bordered w-24"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
          />
          {(priceMin || priceMax) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setPriceMin("");
                setPriceMax("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-base-content/60 mb-4">
        Showing {filteredNfts.length} of {nfts.length} NFTs
      </div>

      {/* NFT Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg text-dayak-green-600"></span>
        </div>
      ) : filteredNfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-2xl font-bold mb-2">No NFTs Found</h3>
          <p className="text-base-content/60">Try adjusting your filters or mint a new NFT!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map(nft => (
            <NFTCard key={nft.tokenId} tokenId={nft.tokenId} onAction={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};
