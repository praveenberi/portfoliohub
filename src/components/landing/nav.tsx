"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string; requiresAuth?: boolean };

const navLinks: NavLink[] = [
  { label: "Features",   href: "#features"                          },
  { label: "Templates",  href: "#templates"                         },
  { label: "Jobs",       href: "/dashboard/jobs", requiresAuth: true },
  { label: "Leaderboard",href: "/dashboard/leaderboard"             },
];

export function LandingNav() {
  const { data: session } = useSession();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resolveHref = (link: NavLink) =>
    link.requiresAuth && !session
      ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
      : link.href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] shadow-dark-card"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Logo size={34} withText textSize="xl" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={resolveHref(link)}
              className="px-4 py-2 text-sm text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] rounded-lg transition-all duration-150 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle size="sm" />
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-bold rounded-xl btn-brand"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text)] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-bold rounded-xl btn-brand">
                Get started free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            {mobileOpen ? <X size={20} weight="bold" className="text-[var(--text)]" /> : <List size={20} weight="bold" className="text-[var(--text)]" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={resolveHref(link)}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover-bg)] hover:text-[var(--text)] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              <Link href="/login" className="block px-4 py-2.5 text-sm font-medium text-center text-[var(--text)] border border-[var(--border)] rounded-xl hover:bg-[var(--hover-bg)] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="block px-4 py-2.5 text-sm font-bold text-center btn-brand rounded-xl">
                Get started free
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
