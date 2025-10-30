"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-gradient-to-b from-base-100 via-base-200/50 to-base-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dayak-green-950/20 via-transparent to-dayak-green-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]" />

          {/* Animated Grid Lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(34,197,94,0.1)_25px,rgba(34,197,94,0.1)_26px,transparent_27px,transparent_74px,rgba(34,197,94,0.1)_75px,rgba(34,197,94,0.1)_76px,transparent_77px),linear-gradient(rgba(34,197,94,0.1)_24px,transparent_25px,transparent_26px,rgba(34,197,94,0.1)_27px,rgba(34,197,94,0.1)_74px,transparent_75px,transparent_76px,rgba(34,197,94,0.1)_77px)] bg-[size:100px_100px] animate-pulse" />
          </div>
        </div>

        <div
          className={`relative z-10 container mx-auto max-w-7xl transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                  Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-dayak-green-400 to-dayak-green-600">
                    DeFi
                  </span>{" "}
                  journey
                  <br />
                  starts here
                </h1>
                <p className="text-xl text-base-content/70 max-w-xl mx-auto lg:mx-0">
                  Experience seamless token swaps and NFT trading on Lisk Sepolia testnet
                </p>
              </div>

              <div className="mb-8">
                <a
                  href="/dex"
                  className="btn btn-lg bg-dayak-green-600 hover:bg-dayak-green-700 border-none text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </a>
              </div>

              {/* Partner Logos */}
              <div className="flex items-center justify-center lg:justify-start gap-8 opacity-60">
                <div className="text-sm font-medium">Built on</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-dayak-green-500 rounded-full"></div>
                  <span className="font-semibold">Lisk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span className="font-semibold">Scaffold-ETH</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Mockup */}
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="relative bg-base-200/80 backdrop-blur-xl rounded-3xl p-6 border border-dayak-green-600/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Quick Exchange</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Swap Interface Mockup */}
                <div className="space-y-4">
                  <div className="bg-base-300/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-base-content/60">From</span>
                      <span className="text-sm text-base-content/60">Balance: 1,000</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-dayak-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        W
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold">150.0</div>
                        <div className="text-sm text-base-content/60">WSP</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-dayak-green-600 rounded-full flex items-center justify-center text-white">
                      ↓
                    </div>
                  </div>

                  <div className="bg-base-300/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-base-content/60">To</span>
                      <span className="text-sm text-base-content/60">Balance: 500</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        s
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold">75.0</div>
                        <div className="text-sm text-base-content/60">sUSDC</div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full btn bg-dayak-green-600  border-none text-white rounded-2xl disabled:bg-dayak-green-600 disabled:text-white"
                    disabled
                  >
                    Swap Tokens
                  </button>
                </div>
              </div>

              {/* Floating NFT Card */}
              <div className="absolute -top-4 -right-4 bg-base-200/90 backdrop-blur-xl rounded-2xl p-4 border border-dayak-green-600/20 shadow-xl w-48 animate-float">
                <div className="w-full h-32 bg-gradient-to-br from-dayak-green-400 to-dayak-green-600 rounded-xl mb-3 flex items-center justify-center text-white text-2xl">
                  🎨
                </div>
                <div className="text-sm font-semibold mb-1">Bekantan NFT</div>
                <div className="text-xs text-base-content/60 mb-2">150 WSP</div>
                <div className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full inline-block">Listed</div>
              </div>

              {/* Floating Stats */}
              <div
                className="absolute -bottom-4 -left-4 bg-base-200/90 backdrop-blur-xl rounded-2xl p-4 border border-dayak-green-600/20 shadow-xl animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="text-xs text-base-content/60 mb-1">Total Volume</div>
                <div className="text-lg font-bold text-dayak-green-400">1,250 WSP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">DeFi shouldn't feel complicated</h2>
            <p className="text-xl text-base-content/70">Simple, secure, and powerful tools for everyone</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: "💱",
                title: "Instant Swaps",
                desc: "Trade WSP and sUSDC instantly with 0.3% fees. No registration required.",
                highlight: "0.3% fees",
              },

              {
                icon: "🎨",
                title: "NFT Marketplace",
                desc: "Mint, buy, and sell unique NFTs. Built-in IPFS storage for metadata.",
                highlight: "1% marketplace fee",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-base-200/50 backdrop-blur-sm rounded-3xl p-8 border border-dayak-green-600/10 hover:border-dayak-green-600/30 transition-all duration-300 hover:scale-105 h-full">
                  <div className="text-5xl mb-6 group-hover:animate-bounce">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-base-content/70 mb-4">{feature.desc}</p>
                  <div className="inline-block bg-dayak-green-600/20 text-dayak-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    {feature.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-dayak-green-950/20 to-dayak-green-900/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start your DeFi journey?</h2>
          <p className="text-xl text-base-content/70 mb-8">Join thousands of users already trading on wapSewap</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dex"
              className="btn btn-lg bg-dayak-green-600 hover:bg-dayak-green-700 border-none text-white px-8 rounded-2xl"
            >
              Start Trading
            </a>
            <a
              href="/marketplace"
              className="btn btn-lg btn-outline border-dayak-green-600 text-dayak-green-400 hover:bg-dayak-green-600 hover:text-white px-8 rounded-2xl"
            >
              Explore NFTs
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
