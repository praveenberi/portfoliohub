"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  ChartBar,
  Eye,
  BookmarkSimple,
  Layout,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { STATUS_COLORS, STATUS_LABELS, timeAgo } from "@/lib/utils";
import type { Application, Job } from "@prisma/client";

interface OverviewProps {
  stats: {
    totalApplications: number;
    portfolioViews: number;
    savedJobs: number;
    activeApplications: number;
    interviewsScheduled: number;
    offersReceived: number;
    applicationsByStatus: Record<string, number>;
  };
  portfolio: { views: number; isPublished: boolean; slug: string } | null;
  recentApplications: (Application & { job: Job })[];
  user: { name?: string | null; username?: string | null };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function DashboardOverview({ stats, portfolio, recentApplications, user }: OverviewProps) {
  const statCards = [
    {
      label: "Total Applications",
      value: stats.totalApplications,
      icon: Briefcase,
      href: "/dashboard/tracker",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Portfolio Views",
      value: stats.portfolioViews,
      icon: Eye,
      href: "/dashboard/portfolio",
      color: "bg-accent-50 text-accent-600",
    },
    {
      label: "Active Pipeline",
      value: stats.activeApplications,
      icon: ChartBar,
      href: "/dashboard/tracker",
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Saved Jobs",
      value: stats.savedJobs,
      icon: BookmarkSimple,
      href: "/dashboard/jobs",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Good morning{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Here&apos;s a snapshot of your job search.
        </p>
      </motion.div>

      {/* Portfolio status banner */}
      {!portfolio?.isPublished && (
        <motion.div variants={item}>
          <div className="bg-zinc-950 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Layout size={16} className="text-accent-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Your portfolio isn&apos;t live yet</div>
                <div className="text-xs text-zinc-500">Publish it so recruiters can find you.</div>
              </div>
            </div>
            <Link
              href="/dashboard/portfolio"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-accent-500 text-white text-xs font-semibold rounded-lg hover:bg-accent-400 active:scale-[0.98] transition-all"
            >
              Build portfolio
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-card transition-all duration-200 group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon size={18} weight="duotone" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">
              {card.value}
            </div>
            <div className="text-xs text-zinc-500">{card.label}</div>
          </Link>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-950">Recent Applications</h2>
            <Link href="/dashboard/tracker" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Briefcase size={32} className="text-zinc-200 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No applications yet.</p>
                <Link href="/dashboard/jobs" className="mt-3 inline-flex text-xs font-medium text-accent-600 hover:text-accent-700">
                  Browse jobs
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-950 truncate">{app.job.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{app.job.company} · {timeAgo(app.appliedAt)}</div>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div variants={item} className="space-y-4">
          {/* Interviews */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Calendar size={16} className="text-violet-600" />
              </div>
              <div className="text-sm font-semibold text-zinc-950">Interviews</div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-zinc-950">
              {stats.interviewsScheduled}
            </div>
            <div className="text-xs text-zinc-400 mt-1">scheduled</div>
          </div>

          {/* Offers */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent-50 flex items-center justify-center">
                <CheckCircle size={16} className="text-accent-600" />
              </div>
              <div className="text-sm font-semibold text-zinc-950">Offers</div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-zinc-950">
              {stats.offersReceived}
            </div>
            <div className="text-xs text-zinc-400 mt-1">received</div>
          </div>

          {/* Portfolio live */}
          {portfolio?.isPublished && (
            <div className="bg-zinc-950 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-xs font-medium text-white">Portfolio live</span>
              </div>
              <Link
                href={`/${user.username}`}
                target="_blank"
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                showup.com/{user.username}
                <ArrowRight size={10} />
              </Link>
              <div className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5">
                <Clock size={12} />
                {stats.portfolioViews} views total
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
