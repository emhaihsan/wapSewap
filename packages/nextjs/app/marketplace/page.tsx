import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
};

export default function Marketplace() {
  return (
    <>
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold mb-4 text-dayak-green-400">NFT Marketplace</h1>
            <p className="text-base-content/70 mb-12">
              Browse, list, and trade unique NFTs on wapSewap. 1% fee goes to platform sustainability.
            </p>

            {/* Placeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  className="rounded-lg border border-dayak-green-900/30 overflow-hidden hover:border-dayak-green-600/50 transition cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-dayak-green-900/30 to-dayak-green-950/30 flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">NFT #{i}</h3>
                    <p className="text-sm text-base-content/60 mb-3">Owner: 0x...</p>
                    <button className="btn btn-sm btn-outline border-dayak-green-600 text-dayak-green-400 w-full">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
