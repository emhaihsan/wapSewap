"use client";

import { LiquidityPanel } from "~~/components/dex/LiquidityPanel";
import { PoolStats } from "~~/components/dex/PoolStats";
import { SwapPanel } from "~~/components/dex/SwapPanel";
import { TokenFaucet } from "~~/components/dex/TokenFaucet";

export default function DEX() {
  return (
    <main className="flex-1 bg-gradient-to-b from-base-100 via-base-200/30 to-base-100">
      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_50%)]" />

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dayak-green-400 to-dayak-green-600">
                Mini Decentralized Exchange
              </span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Get tokens for free through the <strong>Faucet</strong> or try <strong>Swapping tokens</strong> and add
              them to <strong>Liquidity</strong>!
            </p>
          </div>

          {/* Token Faucet - Prominent Card */}
          <div className="mb-12">
            <TokenFaucet />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-72">
            {/* Swap Panel */}
            <div className="lg:col-span-1">
              <SwapPanel />
            </div>

            {/* Liquidity Panel */}
            <div className="lg:col-span-1">
              <LiquidityPanel />
            </div>

            {/* Pool Stats */}
            <div className="lg:col-span-1">
              <PoolStats />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
