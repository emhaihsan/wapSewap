"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "./scaffold-eth";

export const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "DEX", href: "/dex" },
    { label: "Events", href: "/events" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-dayak-green-900 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dayak-green-500 to-dayak-green-700 flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
          <span className="hidden sm:inline text-dayak-green-400">wapSewap</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg transition ${
                isActive(item.href) ? "bg-dayak-green-600 text-white" : "text-base-content hover:bg-dayak-green-900/30"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Connect Button */}
        <RainbowKitCustomConnectButton />
      </nav>
    </header>
  );
};
