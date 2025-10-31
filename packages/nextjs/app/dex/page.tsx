"use client";

import { SwapPanel } from "~~/components/dex/SwapPanel";
import { LiquidityPanel } from "~~/components/dex/LiquidityPanel";
import { PoolStats } from "~~/components/dex/PoolStats";
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
                Decentralized Exchange
              </span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Swap tokens instantly and provide liquidity to earn fees
            </p>
          </div>

          {/* Token Faucet - Prominent Card */}
          <div className="mb-12">
            <TokenFaucet />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-6 border border-dayak-green-600/10 hover:border-dayak-green-600/30 transition-all duration-300">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Instant Swaps</h3>
              <p className="text-sm text-base-content/70">Trade WSP and sUSDC with 0.3% fee</p>
            </div>
            <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-6 border border-dayak-green-600/10 hover:border-dayak-green-600/30 transition-all duration-300">
              <div className="text-3xl mb-3">💧</div>
              <h3 className="font-bold text-lg mb-2">Earn Fees</h3>
              <p className="text-sm text-base-content/70">Provide liquidity and earn from every trade</p>
            </div>
            <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-6 border border-dayak-green-600/10 hover:border-dayak-green-600/30 transition-all duration-300">
              <div className="text-3xl mb-3">🚰</div>
              <h3 className="font-bold text-lg mb-2">Free Tokens</h3>
              <p className="text-sm text-base-content/70">Get test tokens from faucet every 24h</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
