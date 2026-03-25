"use client";

import { Users, Briefcase, Layout, ChartBar, TrendUp, Eye } from "@phosphor-icons/react";

type Stats = {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  totalPortfolios: number;
  publishedPortfolios: number;
  totalJobs: number;
  pendingJobs: number;
  totalApplications: number;
};

export function AdminAnalyticsClient({
  stats,
  recentSignups,
  topPortfolios,
}: {
  stats: Stats;
  recentSignups: { id: string; name: string | null; email: string; createdAt: Date; role: string }[];
  topPortfolios: { id: string; slug: string; title: string; views: number; user: { name: string | null } }[];
}) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, sub: `+${stats.newUsers7d} this week`, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "New Users (30d)", value: stats.newUsers30d, sub: "Last 30 days", icon: TrendUp, color: "text-green-600 bg-green-50" },
    { label: "Portfolios", value: stats.totalPortfolios, sub: `${stats.publishedPortfolios} published`, icon: Layout, color: "text-purple-600 bg-purple-50" },
    { label: "Jobs", value: stats.totalJobs, sub: `${stats.pendingJobs} pending approval`, icon: Briefcase, color: "text-amber-600 bg-amber-50" },
    { label: "Applications", value: stats.totalApplications, sub: "All time", icon: ChartBar, color: "text-zinc-600 bg-zinc-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Platform overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-zinc-200 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon size={18} weight="fill" />
            </div>
            <p className="text-2xl font-bold text-zinc-950">{c.value.toLocaleString()}</p>
            <p className="text-xs font-medium text-zinc-700 mt-0.5">{c.label}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-950">Recent Signups</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentSignups.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{u.name ?? u.email}</p>
                  <p className="text-xs text-zinc-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "ADMIN" ? "bg-red-50 text-red-700" :
                    u.role === "RECRUITER" ? "bg-blue-50 text-blue-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>{u.role}</span>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top portfolios */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-950">Top Portfolios by Views</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {topPortfolios.length === 0 && (
              <p className="text-sm text-zinc-400 text-center py-8">No published portfolios yet</p>
            )}
            {topPortfolios.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{p.title}</p>
                    <p className="text-xs text-zinc-400">/{p.slug} · {p.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Eye size={12} />
                  {p.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
