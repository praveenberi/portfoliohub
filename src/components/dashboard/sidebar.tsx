"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  SquaresFour,
  Layout,
  Briefcase,
  ChartBar,
  User,
  Gear,
  SignOut,
  ShieldCheck,
  EnvelopeSimple,
  X,
  List,
} from "@phosphor-icons/react";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";
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
  { href: "/dashboard", icon: SquaresFour, label: "Overview" },
  { href: "/dashboard/portfolio", icon: Layout, label: "Portfolio" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Browse Jobs" },
  { href: "/dashboard/tracker", icon: ChartBar, label: "Applications" },
  { href: "/dashboard/messages", icon: EnvelopeSimple, label: "Messages" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Gear, label: "Settings" },
];

const mobileTabItems = [
  { href: "/dashboard", icon: SquaresFour, label: "Home" },
  { href: "/dashboard/portfolio", icon: Layout, label: "Portfolio" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/dashboard/messages", icon: EnvelopeSimple, label: "Messages" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/messages/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, [pathname]);

  // Close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="white" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#22c55e" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-950 tracking-tight text-sm">PortfolioHub</span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-zinc-100">
          <X size={18} className="text-zinc-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const isMessages = item.href === "/dashboard/messages";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              )}
            >
              <item.icon size={18} weight={isActive ? "fill" : "regular"} />
              {item.label}
              {isMessages && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-green-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-zinc-950 -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
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
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            )}
          >
            <ShieldCheck size={18} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden flex-shrink-0">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={32} height={32} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-zinc-600">
                {getInitials(user.name ?? user.email)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-950 truncate">{user.name}</div>
            <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-zinc-100"
            title="Sign out"
          >
            <SignOut size={14} className="text-zinc-500" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 flex-col z-40 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger button (in top-left of page) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm"
      >
        <List size={18} className="text-zinc-700" />
      </button>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white flex flex-col z-50 shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40 flex items-center justify-around px-2 pb-safe">
        {mobileTabItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const isMessages = item.href === "/dashboard/messages";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-colors",
                isActive ? "text-zinc-950" : "text-zinc-400"
              )}
            >
              <item.icon size={22} weight={isActive ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-green-500 text-white rounded-full flex items-center justify-center">
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
