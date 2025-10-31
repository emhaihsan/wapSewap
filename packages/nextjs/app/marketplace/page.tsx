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
                  NFT Marketplace
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
                  Mint Your NFT
                </button>
              ) : (
                <div className="text-base-content/60">Connect wallet to mint NFTs</div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
              <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-dayak-green-600/10">
                <div className="text-2xl font-bold text-dayak-green-400">1%</div>
                <div className="text-xs text-base-content/60">Platform Fee</div>
              </div>
              <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-dayak-green-600/10">
                <div className="text-2xl font-bold text-dayak-green-400">WSP</div>
                <div className="text-xs text-base-content/60">Payment Token</div>
              </div>
              <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-dayak-green-600/10">
                <div className="text-2xl font-bold text-dayak-green-400">IPFS</div>
                <div className="text-xs text-base-content/60">Decentralized Storage</div>
              </div>
            </div>

            {/* Marketplace Grid */}
            <MarketplaceGrid />
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
