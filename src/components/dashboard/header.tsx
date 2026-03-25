"use client";

import { Bell, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search + Refresh */}
      <div className="flex items-center gap-2 hidden md:flex">
        <div className="relative w-64">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
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

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-50 border border-zinc-200 transition-colors">
          <Bell size={16} className="text-zinc-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
        </button>

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
