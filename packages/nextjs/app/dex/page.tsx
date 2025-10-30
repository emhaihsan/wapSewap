"use client";

import { SwapPanel } from "~~/components/dex/SwapPanel";
import { LiquidityPanel } from "~~/components/dex/LiquidityPanel";
import { PoolStats } from "~~/components/dex/PoolStats";
import { TokenFaucet } from "~~/components/dex/TokenFaucet";

export default function DEX() {
  return (
    <>
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold mb-4 text-dayak-green-400">DEX</h1>
            <p className="text-base-content/70 mb-12">Swap tokens and provide liquidity on wapSewap DEX.</p>

            {/* Token Faucet - Full width at top */}
            <div className="mb-8">
              <TokenFaucet />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
    </>
  );
}
