"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "./scaffold-eth";

export const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: "Home", href: "/" },
    { label: "DEX", href: "/dex" },
    { label: "Marketplace", href: "/marketplace" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-300/50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dayak-green-500 to-dayak-green-700 flex items-center justify-center shadow-lg group-hover:shadow-dayak-green-500/50 transition-all duration-300">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-dayak-green-400 to-dayak-green-600 bg-clip-text text-transparent">
              wapSewap
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-2 bg-base-200/50 backdrop-blur-sm rounded-full px-2 py-2 border border-base-300/50">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-dayak-green-600 text-white shadow-lg shadow-dayak-green-600/30"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Connect Button */}
          <div className="flex items-center gap-0">
            <RainbowKitCustomConnectButton />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isActive(item.href)
                  ? "bg-dayak-green-600 text-white shadow-lg"
                  : "bg-base-200/50 text-base-content/70 hover:bg-base-300/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};
