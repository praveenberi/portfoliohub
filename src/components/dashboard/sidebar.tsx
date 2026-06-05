"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  SquaresFour, Layout, Briefcase, ChartBar, User, Gear, SignOut,
  ShieldCheck, EnvelopeSimple, X, List, Article, Microphone, Trophy,
} from "@phosphor-icons/react";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";
import { Logo } from "@/components/logo";
import Image from "next/image";

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
    username?: string | null;
  };
}

const navItems = [
  { href: "/dashboard",               icon: SquaresFour,    label: "Overview"      },
  { href: "/dashboard/portfolio",     icon: Layout,         label: "Portfolio"     },
  { href: "/dashboard/resume",        icon: Article,        label: "Resume"        },
  { href: "/dashboard/jobs",          icon: Briefcase,      label: "Browse Jobs"   },
  { href: "/dashboard/tracker",       icon: ChartBar,       label: "Applications"  },
  { href: "/dashboard/mock-interview",icon: Microphone,     label: "Mock Interview"},
  { href: "/dashboard/messages",      icon: EnvelopeSimple, label: "Messages"      },
  { href: "/dashboard/profile",       icon: User,           label: "Profile"       },
  { href: "/dashboard/leaderboard",   icon: Trophy,         label: "Leaderboard"   },
  { href: "/dashboard/settings",      icon: Gear,           label: "Settings"      },
];

const mobileTabItems = [
  { href: "/dashboard",           icon: SquaresFour,    label: "Home"      },
  { href: "/dashboard/portfolio", icon: Layout,         label: "Portfolio" },
  { href: "/dashboard/jobs",      icon: Briefcase,      label: "Jobs"      },
  { href: "/dashboard/messages",  icon: EnvelopeSimple, label: "Messages"  },
  { href: "/dashboard/profile",   icon: User,           label: "Profile"   },
  { href: "/dashboard/leaderboard",icon: Trophy,        label: "Ranks"     },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const r = await fetch("/api/messages/unread-count", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setUnreadCount(d.count ?? 0);
      } catch {}
    }
    fetchCount();
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
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* Logo header */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/">
          <Logo size={28} withText textSize="base" />
        </Link>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
          <X size={16} className="text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((navItem) => {
          const isActive   = navItem.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(navItem.href);
          const isMessages = navItem.href === "/dashboard/messages";

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "text-[#080c14]"
                  : "text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #00d4ff 0%, #e040fb 100%)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <navItem.icon
                size={18}
                weight={isActive ? "fill" : "regular"}
                className={cn("relative z-10 transition-colors", isActive ? "text-[#080c14]" : "group-hover:text-cyan-500")}
              />
              <span className="relative z-10">{navItem.label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="relative z-10 ml-auto text-[10px] font-bold bg-cyan-500 text-dark-bg rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              pathname.startsWith("/admin")
                ? "bg-gradient-to-r from-cyan-500 to-magenta-500 text-dark-bg"
                : "text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text)]"
            )}
          >
            <ShieldCheck size={18} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hover-bg)] transition-colors group cursor-default">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-500/20">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-cyan-500 to-magenta-500 text-dark-bg">
                {getInitials(user.name ?? user.email)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--text)] truncate">{user.name}</div>
            <div className="text-[10px] text-[var(--text-subtle)] truncate">{user.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--text-muted)] hover:text-red-400"
            title="Sign out"
          >
            <SignOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex-col z-40 hidden md:flex print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden print:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-dark-card"
      >
        <List size={18} className="text-[var(--text-muted)]" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50 shadow-dark-card"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-40 flex items-center justify-around px-2 pb-safe">
        {mobileTabItems.map((tabItem) => {
          const isActive   = tabItem.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tabItem.href);
          const isMessages = tabItem.href === "/dashboard/messages";

          return (
            <Link
              key={tabItem.href}
              href={tabItem.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-colors",
                isActive ? "text-cyan-400" : "text-[var(--text-subtle)]"
              )}
            >
              <tabItem.icon size={22} weight={isActive ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{tabItem.label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-cyan-500 text-dark-bg rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
