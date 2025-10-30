"use client";

import { useState } from "react";

type EventType = "all" | "swaps" | "liquidity" | "marketplace";

const mockEvents = [
  { id: 1, type: "swaps", title: "Token Swap", description: "100 WAPS → 50 USDC", time: "2 mins ago" },
  { id: 2, type: "liquidity", title: "Liquidity Added", description: "50 WAPS + 50 USDC", time: "5 mins ago" },
  { id: 3, type: "marketplace", title: "NFT Purchased", description: "Dayak Art #123", time: "10 mins ago" },
  { id: 4, type: "swaps", title: "Token Swap", description: "25 USDC → 50 WAPS", time: "15 mins ago" },
  { id: 5, type: "liquidity", title: "Liquidity Removed", description: "25 WAPS + 25 USDC", time: "20 mins ago" },
];

export default function Events() {
  const [activeFilter, setActiveFilter] = useState<EventType>("all");

  const filteredEvents = activeFilter === "all" ? mockEvents : mockEvents.filter(event => event.type === activeFilter);

  const filterButtons: { type: EventType; label: string }[] = [
    { type: "all", label: "All Events" },
    { type: "swaps", label: "Swaps" },
    { type: "liquidity", label: "Liquidity" },
    { type: "marketplace", label: "Marketplace" },
  ];
  return (
    <>
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-dayak-green-400">Events</h1>
              <p className="text-base-content/70">Track all transactions and activities on wapSewap</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {filterButtons.map(filter => (
                <button
                  key={filter.type}
                  onClick={() => setActiveFilter(filter.type)}
                  className={`btn btn-sm ${
                    activeFilter === filter.type
                      ? "btn-primary bg-dayak-green-600 hover:bg-dayak-green-700 border-none"
                      : "btn-outline border-dayak-green-600 text-dayak-green-400 hover:bg-dayak-green-900/20"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-dayak-green-900/30 hover:border-dayak-green-600/50 hover:bg-base-200/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {/* Event Type Badge */}
                        <div className="w-10 h-10 rounded-lg bg-dayak-green-900/30 flex items-center justify-center text-lg">
                          {event.type === "swaps" && "💱"}
                          {event.type === "liquidity" && "💧"}
                          {event.type === "marketplace" && "🎨"}
                        </div>
                        {/* Event Info */}
                        <div>
                          <h3 className="font-semibold text-base-content">{event.title}</h3>
                          <p className="text-sm text-base-content/60">{event.description}</p>
                        </div>
                      </div>
                    </div>
                    {/* Time & Link */}
                    <div className="text-right">
                      <p className="text-xs text-base-content/50 mb-2">{event.time}</p>
                      <a
                        href="#"
                        className="text-dayak-green-400 hover:text-dayak-green-300 text-xs font-medium transition"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-base-content/50">
                <p className="text-sm">No events found for this filter</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
