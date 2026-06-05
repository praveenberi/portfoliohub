"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour, Users, Briefcase, Layout, ChartBar, ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const adminLinks = [
  { href: "/admin",            icon: SquaresFour, label: "Overview"   },
  { href: "/admin/users",      icon: Users,       label: "Users"      },
  { href: "/admin/jobs",       icon: Briefcase,   label: "Jobs"       },
  { href: "/admin/templates",  icon: Layout,      label: "Templates"  },
  { href: "/admin/analytics",  icon: ChartBar,    label: "Analytics"  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-40 hidden md:flex">
      <div className="px-5 h-16 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center">
            <ShieldCheck size={13} className="text-dark-bg" weight="fill" />
          </div>
          <span className="font-bold text-[var(--text)] tracking-tight text-sm">Admin Panel</span>
        </div>
        <ThemeToggle size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminLinks.map((link) => {
          const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "text-dark-bg"
                  : "text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text)]"
              )}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #00d4ff 0%, #e040fb 100%)" }}
                />
              )}
              <link.icon
                size={17}
                weight={isActive ? "fill" : "regular"}
                className={cn("relative z-10", isActive ? "text-dark-bg" : "group-hover:text-cyan-500")}
              />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--border)]">
        <Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-cyan-400 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
