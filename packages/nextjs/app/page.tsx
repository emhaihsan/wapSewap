import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-dayak-green-950/50 via-base-100 to-base-100 pointer-events-none" />

          <div className="relative z-10 container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-dayak-green-400 to-dayak-green-600">
              Welcome to wapSewap
            </h1>

            <p className="text-lg sm:text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
              A decentralized exchange and NFT marketplace built on Lisk Sepolia. Trade tokens, provide liquidity, and
              collect unique digital assets.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/dex"
                className="btn btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none text-white px-8"
              >
                Try DEX
              </a>
              <a
                href="/marketplace"
                className="btn btn-outline border-dayak-green-600 text-dayak-green-400 hover:bg-dayak-green-900/20 px-8"
              >
                Browse NFTs
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 p-6 rounded-xl bg-base-200/50 border border-dayak-green-900/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-dayak-green-400">7</div>
                <div className="text-sm text-base-content/60 mt-2">Smart Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dayak-green-400">3</div>
                <div className="text-sm text-base-content/60 mt-2">Advanced Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dayak-green-400">100%</div>
                <div className="text-sm text-base-content/60 mt-2">Verified</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-base-200/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-dayak-green-400">Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 hover:border-dayak-green-600/50 transition">
                <div className="w-12 h-12 rounded-lg bg-dayak-green-900/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">💱</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Decentralized Exchange</h3>
                <p className="text-base-content/70">
                  Swap tokens with 0.3% fee. Provide liquidity and earn rewards through fee distribution.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 hover:border-dayak-green-600/50 transition">
                <div className="w-12 h-12 rounded-lg bg-dayak-green-900/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold mb-2">NFT Marketplace</h3>
                <p className="text-base-content/70">
                  List and trade unique NFTs. 1% immutable fee ensures platform sustainability.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 hover:border-dayak-green-600/50 transition">
                <div className="w-12 h-12 rounded-lg bg-dayak-green-900/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">🏭</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Factory Pattern</h3>
                <p className="text-base-content/70">
                  Create multiple token pairs on demand. Scalable infrastructure for future growth.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 hover:border-dayak-green-600/50 transition">
                <div className="w-12 h-12 rounded-lg bg-dayak-green-900/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Price Oracle</h3>
                <p className="text-base-content/70">
                  RedStone oracle integration for accurate ETH/USD pricing with timestamp validation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
