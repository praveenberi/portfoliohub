"use client";

import { Bell, MagnifyingGlass, ArrowClockwise, X, User, SignOut, Camera, ArrowSquareOut } from "@phosphor-icons/react";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/lib/enums";
import { Logo } from "@/components/logo";

interface HeaderProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
    username?: string | null;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    if (bellOpen || profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [bellOpen, profileOpen]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3 MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: base64 }),
        });
        router.refresh();
        setProfileOpen(false);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 print:hidden">
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

      {/* Mobile: centered logo */}
      <span className="md:hidden"><Logo size={26} withText textSize="sm" /></span>

      <div className="hidden md:block flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* View Portfolio link */}
        {user.username && (
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <ArrowSquareOut size={13} />
            View Portfolio
          </Link>
        )}

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

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden ring-2 ring-transparent hover:ring-zinc-300 transition-all flex items-center justify-center"
          >
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-zinc-600">
                {getInitials(user.name ?? user.email)}
              </span>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-zinc-200 shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100">
                <p className="text-xs font-semibold text-zinc-950 truncate">{user.name ?? "User"}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <Camera size={14} />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={14} /> Edit Profile
                </Link>
                {user.username && (
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ArrowSquareOut size={14} /> View Portfolio
                  </Link>
                )}
                <hr className="my-1 border-zinc-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <SignOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>
    </header>
  );
}
