"use client";

import {
  Bell, MagnifyingGlass, ArrowClockwise, X, User, SignOut,
  Camera, ArrowSquareOut, Eye, ArrowRight,
} from "@phosphor-icons/react";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/lib/enums";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
    username?: string | null;
  };
  isPublished?: boolean;
  unreadCount?: number;
}

export function DashboardHeader({ user, isPublished = false, unreadCount: initialUnread = 0 }: HeaderProps) {
  const router = useRouter();
  const [bellOpen, setBellOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const bellRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUnreadCount(initialUnread); }, [initialUnread]);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const r    = await fetch("/api/messages/unread-count", { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled && typeof data?.count === "number") setUnreadCount(data.count);
      } catch {}
    }
    const interval = setInterval(fetchCount, 30000);
    const onFocus   = () => fetchCount();
    const onRefresh = () => fetchCount();
    window.addEventListener("focus", onFocus);
    window.addEventListener("unread-count:refresh", onRefresh);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("unread-count:refresh", onRefresh);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current    && !bellRef.current.contains(e.target as Node))    setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    if (bellOpen || profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [bellOpen, profileOpen]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3 MB"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        await fetch("/api/profile/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatarUrl: base64 }) });
        router.refresh();
        setProfileOpen(false);
      };
      reader.readAsDataURL(file);
    } finally { setUploading(false); e.target.value = ""; }
  }

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 print:hidden">
      {/* Mobile spacer for hamburger */}
      <div className="w-10 md:hidden" />

      {/* Desktop: Search + Refresh */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative w-60">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search jobs, portfolios…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/08 transition-all"
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--muted)] border border-[var(--border)] hover:border-cyan-500/30 hover:bg-[var(--hover-bg)] transition-colors"
          title="Refresh"
        >
          <ArrowClockwise size={14} className="text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Mobile: centered logo */}
      <span className="md:hidden"><Logo size={28} withText textSize="base" /></span>

      <div className="hidden md:block flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* View live portfolio */}
        {isPublished && user.username && (
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="hidden md:flex items-center gap-2.5 pl-2 pr-3 py-1.5 border border-[var(--border)] rounded-xl bg-[var(--muted)] hover:border-cyan-500/40 hover:bg-[var(--hover-bg)] transition-all group"
          >
            <span className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Eye size={14} weight="fill" className="text-cyan-400" />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[12px] font-semibold text-[var(--text)]">View portfolio</span>
              <span className="text-[10px] text-[var(--text-muted)]">Opens in new tab</span>
            </span>
            <ArrowRight size={12} className="text-[var(--text-muted)] group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}

        {/* Theme toggle */}
        <ThemeToggle size="sm" />

        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] hover:border-cyan-500/40 hover:bg-[var(--hover-bg)] transition-colors"
          >
            <Bell size={15} className="text-[var(--text-muted)]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-dark-bg text-[9px] font-bold leading-none flex items-center justify-center border-2 border-[var(--surface)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-11 w-72 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-dark-card z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <span className="text-sm font-bold text-[var(--text)]">Notifications</span>
                <button onClick={() => setBellOpen(false)} className="p-1 rounded-lg hover:bg-[var(--hover-bg)]">
                  <X size={13} className="text-[var(--text-muted)]" />
                </button>
              </div>
              {unreadCount > 0 ? (
                <Link
                  href="/dashboard/messages"
                  onClick={() => setBellOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Bell size={15} weight="fill" className="text-cyan-400" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-[var(--text)]">
                      {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)]">View in messages</span>
                  </span>
                </Link>
              ) : (
                <div className="py-8 text-center">
                  <Bell size={26} className="text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">No new notifications</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-cyan-500/20 hover:ring-cyan-500/50 transition-all flex items-center justify-center"
          >
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-cyan-500 to-magenta-500 text-dark-bg">
                {getInitials(user.name ?? user.email)}
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-52 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-dark-card z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text)] truncate">{user.name ?? "User"}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-muted)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-50"
                >
                  <Camera size={13} /> {uploading ? "Uploading…" : "Upload Photo"}
                </button>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-muted)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={13} /> Edit Profile
                </Link>
                {user.username && (
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-muted)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ArrowSquareOut size={13} /> View Portfolio
                  </Link>
                )}
                <hr className="my-1 border-[var(--border)]" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <SignOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>
    </header>
  );
}
