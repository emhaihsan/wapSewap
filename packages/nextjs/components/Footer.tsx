import React from "react";
import Image from "next/image";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="min-h-0 py-8 px-4 mb-11 lg:mb-0 border-t border-dayak-green-600/20 bg-base-200/30">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Image src="/logo.png" alt="wapSewap Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-dayak-green-400 to-dayak-green-600 bg-clip-text text-transparent">
                wapSewap
              </span>
            </div>
            <p className="text-sm text-base-content/60 mb-4">
              Simple DeFi platform for token swaps, NFT minting, and trading on Lisk Sepolia testnet.{" "}
              <span>
                Built for{" "}
                <a
                  href="https://www.speedrunlisk.xyz/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-dayak-green-400 hover:text-dayak-green-300 transition-colors font-semibold"
                >
                  Lisk Speedrun 2025
                </a>
              </span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-dayak-green-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dex" className="text-base-content/60 hover:text-dayak-green-400 transition-colors">
                  Mini DEX
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-base-content/60 hover:text-dayak-green-400 transition-colors">
                  NFT Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-dayak-green-400">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/LiskHQ/scaffold-lisk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-dayak-green-400 transition-colors"
                >
                  Scaffold Lisk GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://lisk.com/documentation"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-dayak-green-400 transition-colors"
                >
                  Lisk Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com/invite/7EKWJ7b"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base-content/60 hover:text-dayak-green-400 transition-colors"
                >
                  Lisk Dev Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-dayak-green-600/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/60">
            <div>© 2024 wapSewap.</div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              Built with{" "}
              <a
                href="https://github.com/LiskHQ/scaffold-lisk"
                target="_blank"
                rel="noreferrer"
                className="text-dayak-green-400 hover:text-dayak-green-300 transition-colors font-semibold"
              >
                Scaffold Lisk
              </a>{" "}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
