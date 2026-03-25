"use client";

import { Bell, MagnifyingGlass, ArrowClockwise, X } from "@phosphor-icons/react";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { UserRole } from "@/lib/enums";

interface HeaderProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [bellOpen]);

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile: spacer for hamburger button */}
      <div className="w-10 md:hidden" />

      {/* Desktop: Search + Refresh */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative w-64">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search jobs, portfolios..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
          title="Refresh"
        >
          <ArrowClockwise size={15} className="text-zinc-500" />
        </button>
      </div>

      {/* Mobile: centered logo text */}
      <span className="md:hidden text-sm font-semibold text-zinc-950">PortfolioHub</span>

      <div className="hidden md:block flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Bell with dropdown */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-50 border border-zinc-200 transition-colors"
          >
            <Bell size={16} className="text-zinc-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500" />
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl border border-zinc-200 shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <span className="text-sm font-semibold text-zinc-950">Notifications</span>
                <button onClick={() => setBellOpen(false)} className="p-1 rounded-lg hover:bg-zinc-100">
                  <X size={14} className="text-zinc-500" />
                </button>
              </div>
              <div className="py-8 text-center">
                <Bell size={28} className="text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} width={32} height={32} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-zinc-600">
              {getInitials(user.name ?? user.email)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
