"use client";

import { motion } from "framer-motion";
import {
  Users,
  Layout,
  Briefcase,
  ChartBar,
  ShieldCheck,
} from "@phosphor-icons/react";
import { timeAgo } from "@/lib/utils";
interface AdminOverviewProps {
  stats: {
    users: number;
    portfolios: number;
    jobs: number;
    applications: number;
    templates: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    role: string;
    isActive: boolean;
  }>;
  topTemplates: Array<{
    id: string;
    name: string;
    category: string;
    usageCount: number;
  }>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AdminOverview({ stats, recentUsers, topTemplates }: AdminOverviewProps) {
  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Live Portfolios", value: stats.portfolios, icon: Layout, color: "bg-accent-50 text-accent-600" },
    { label: "Active Jobs", value: stats.jobs, icon: Briefcase, color: "bg-violet-50 text-violet-600" },
    { label: "Applications", value: stats.applications, icon: ChartBar, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Admin Overview</h1>
        </div>
        <p className="text-sm text-zinc-500">Platform health and activity summary.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon size={18} weight="duotone" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950">{card.value.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-zinc-200">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-950">Recent signups</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-950 truncate">{user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    user.role === "ADMIN" ? "bg-zinc-950 text-white" :
                    user.role === "RECRUITER" ? "bg-blue-50 text-blue-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>
                    {user.role.toLowerCase()}
                  </span>
                  <span className="text-[11px] text-zinc-400">{timeAgo(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top templates */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-zinc-200">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-950">Popular templates</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {topTemplates.map((t, i) => (
              <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                <span className="text-sm font-mono text-zinc-300">0{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-950">{t.name}</div>
                  <div className="text-xs text-zinc-400">{t.category}</div>
                </div>
                <span className="text-sm font-semibold text-zinc-700">{t.usageCount}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
