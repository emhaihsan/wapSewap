import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DEX",
};

export default function DEX() {
  return (
    <>
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold mb-4 text-dayak-green-400">Decentralized Exchange</h1>
            <p className="text-base-content/70 mb-12">
              Swap tokens, provide liquidity, and earn fees. 0.3% swap fee distributed to liquidity providers.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Swap Panel */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 bg-base-200/30">
                <h2 className="text-2xl font-bold mb-6 text-dayak-green-400">Swap</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">From</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full bg-base-100"
                      disabled
                    />
                  </div>
                  <div className="flex justify-center">
                    <button className="btn btn-circle btn-sm btn-outline border-dayak-green-600">⇅</button>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">To</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full bg-base-100"
                      disabled
                    />
                  </div>
                  <button
                    className="btn btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none w-full"
                    disabled
                  >
                    Connect Wallet to Swap
                  </button>
                </div>
              </div>

              {/* Liquidity Panel */}
              <div className="p-6 rounded-lg border border-dayak-green-900/30 bg-base-200/30">
                <h2 className="text-2xl font-bold mb-6 text-dayak-green-400">Liquidity</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Token A Amount</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full bg-base-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Token B Amount</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full bg-base-100"
                      disabled
                    />
                  </div>
                  <button
                    className="btn btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none w-full"
                    disabled
                  >
                    Connect Wallet to Add Liquidity
                  </button>
                </div>
              </div>
            </div>

            {/* Pool Stats */}
            <div className="mt-8 p-6 rounded-lg border border-dayak-green-900/30 bg-base-200/30">
              <h2 className="text-2xl font-bold mb-6 text-dayak-green-400">Pool Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-base-content/60 mb-2">Total Liquidity</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60 mb-2">24h Volume</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60 mb-2">Swap Fee</div>
                  <div className="text-2xl font-bold text-dayak-green-400">0.3%</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
