"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { MarketplaceGrid } from "~~/components/marketplace/MarketplaceGrid";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { pinFileToIPFS, pinJSONToIPFS, validateNFTFile } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

export default function Marketplace() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Mint NFT function - will be called with dynamic args
  const { writeAsync: mintNFT, isLoading: isMinting } = useScaffoldContractWrite({
    contractName: "WapsewapNFT",
    functionName: "mint",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateNFTFile(file);
    if (error) {
      notification.error(error);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!selectedFile || !nftName || !PINATA_JWT) {
      notification.error("Please fill all fields and configure Pinata JWT");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload image to IPFS
      notification.info("Uploading image to IPFS...");
      const imageHash = await pinFileToIPFS(selectedFile, PINATA_JWT);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      // 2. Upload metadata to IPFS
      notification.info("Uploading metadata...");
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Creator",
            value: connectedAddress || "Unknown",
          },
          {
            trait_type: "Created On",
            value: new Date().toISOString(),
          },
        ],
      };

      const metadataHash = await pinJSONToIPFS(metadata, PINATA_JWT);

      // 3. Mint NFT with metadata hash
      notification.info("Minting NFT...");
      await mintNFT({
        args: [connectedAddress, metadataHash],
      });

      notification.success(`NFT minted successfully! Metadata: ipfs://${metadataHash}`);

      // Reset form
      setShowMintModal(false);
      setSelectedFile(null);
      setPreviewUrl("");
      setNftName("");
      setNftDescription("");
    } catch (error: any) {
      console.error("Mint error:", error);
      notification.error(error?.message || "Failed to mint NFT");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <main className="flex-1 bg-gradient-to-b from-base-100 via-base-200/30 to-base-100">
        {/* Hero Section */}
        <section className="relative py-12 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_50%)]" />

          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dayak-green-400 to-dayak-green-600">
                  NFT Gallery
                </span>
              </h1>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-6">
                Discover, collect, and trade unique digital assets
              </p>

              {/* CTA Button */}
              {isConnected ? (
                <button
                  className="btn btn-lg bg-dayak-green-600 hover:bg-dayak-green-700 border-none text-white px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setShowMintModal(true)}
                >
                  <span className="text-xl mr-2">🎨</span>
                  Create and Mint NFT
                </button>
              ) : (
                <div className="text-base-content/60">Connect wallet to mint NFTs</div>
              )}
            </div>

            {/* Marketplace Grid */}
            <MarketplaceGrid />
            {/* How to Use Guide */}
            <div className="max-w-4xl mx-auto my-12">
              <div className="bg-base-200/50 backdrop-blur-sm rounded-3xl p-8 border border-dayak-green-600/20">
                <h3 className="text-2xl font-bold mb-6 text-center text-dayak-green-400">How to Use NFT Marketplace</h3>

                <div className="space-y-6">
                  {/* Step 1: Mint */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-dayak-green-600 flex items-center justify-center text-white font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">Mint Your NFT</h4>
                      <p className="text-sm text-base-content/70 mb-2">
                        Click <strong>&quot;Mint Your NFT&quot;</strong> button, upload your image (PNG/JPEG, max 2MB),
                        add name and description. Your artwork will be stored on IPFS and minted as an NFT.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: List */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-dayak-green-600 flex items-center justify-center text-white font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">List for Sale</h4>
                      <p className="text-sm text-base-content/70 mb-2">
                        After minting, find your NFT in the marketplace grid. Click{" "}
                        <strong>&quot;List for Sale&quot;</strong>, set your price in WSP tokens, and confirm the
                        transaction.
                      </p>
                      <div className="text-xs text-base-content/60 italic">💡 Platform fee: 1% of sale price</div>
                    </div>
                  </div>

                  {/* Step 3: Buy */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-dayak-green-600 flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">Buy NFTs</h4>
                      <p className="text-sm text-base-content/70 mb-2">
                        Browse listed NFTs below. Click <strong>&quot;Buy Now&quot;</strong> on any NFT you like. Make
                        sure you have enough WSP tokens in your wallet to complete the purchase.
                      </p>
                      <div className="text-xs text-base-content/60 italic">
                        💡 Get WSP tokens from the DEX or Faucet page
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Manage */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-dayak-green-600 flex items-center justify-center text-white font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">Manage Your NFTs</h4>
                      <p className="text-sm text-base-content/70 mb-2">
                        You can <strong>cancel listing</strong> anytime if you change your mind. Your NFTs are always in
                        your wallet and you have full control over them.
                      </p>
                      <div className="text-xs text-base-content/60 italic">
                        💡 All transactions are on-chain and transparent
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mint Modal */}
      {showMintModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-200/95 backdrop-blur-xl border border-dayak-green-600/20">
            <h3 className="font-bold text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-dayak-green-400 to-dayak-green-600">
              Mint New NFT
            </h3>
            <p className="text-sm text-base-content/60 mb-6">Upload your artwork and create a unique digital asset</p>

            <div className="space-y-4">
              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Upload Image</span>
                  <span className="label-text-alt text-xs">PNG or JPEG, max 2MB</span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-dayak-green-600 shadow-lg shadow-dayak-green-600/20">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">NFT Name</span>
                </label>
                <input
                  type="text"
                  placeholder="My Awesome NFT"
                  className="input input-bordered w-full"
                  value={nftName}
                  onChange={e => setNftName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <textarea
                  placeholder="Describe your NFT..."
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={nftDescription}
                  onChange={e => setNftDescription(e.target.value)}
                />
              </div>

              {!PINATA_JWT && (
                <div className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-xs">Pinata JWT not configured. Set NEXT_PUBLIC_PINATA_JWT in .env</span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost rounded-2xl"
                onClick={() => {
                  setShowMintModal(false);
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setNftName("");
                  setNftDescription("");
                }}
                disabled={isUploading || isMinting}
              >
                Cancel
              </button>
              <button
                className="btn bg-dayak-green-600 hover:bg-dayak-green-700 border-none text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleMint}
                disabled={!selectedFile || !nftName || isUploading || isMinting || !PINATA_JWT}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : isMinting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Minting...
                  </>
                ) : (
                  <>
                    <span className="text-lg mr-2">✨</span>
                    Mint NFT
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isUploading && !isMinting && setShowMintModal(false)}></div>
        </div>
      )}
    </>
  );
}
