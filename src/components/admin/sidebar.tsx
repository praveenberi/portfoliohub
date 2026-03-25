"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Users,
  Briefcase,
  Layout,
  ChartBar,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", icon: SquaresFour, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/admin/templates", icon: Layout, label: "Templates" },
  { href: "/admin/analytics", icon: ChartBar, label: "Analytics" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 flex flex-col z-40 hidden md:flex">
      <div className="px-5 h-16 flex items-center gap-3 border-b border-zinc-100">
        <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
          <ShieldCheck size={14} className="text-white" />
        </div>
        <span className="font-semibold text-zinc-950 tracking-tight text-sm">Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminLinks.map((link) => {
          const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              )}
            >
              <link.icon size={18} weight={isActive ? "fill" : "regular"} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-zinc-100">
        <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
