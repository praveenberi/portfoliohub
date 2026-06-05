"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase, Eye, BookmarkSimple, Layout,
  ArrowRight, Clock, Trophy, Lightning,
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16,1,0.3,1] } } };

export function DashboardOverview({ stats, portfolio, recentApplications, user }: OverviewProps) {
  const statCards = [
    {
      label: "Portfolio Views",
      value: stats.portfolioViews,
      icon: Eye,
      href: "/dashboard/portfolio",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      iconColor: "text-cyan-400",
      gradient: "from-cyan-500/5 to-transparent",
    },
    {
      label: "Saved Jobs",
      value: stats.savedJobs,
      icon: BookmarkSimple,
      href: "/dashboard/jobs?tab=saved",
      iconBg: "bg-magenta-500/10 border-magenta-500/20",
      iconColor: "text-magenta-400",
      gradient: "from-magenta-500/5 to-transparent",
    },
    {
      label: "Active Applications",
      value: stats.activeApplications,
      icon: Lightning,
      href: "/dashboard/tracker",
      iconBg: "bg-yellow-500/10 border-yellow-500/20",
      iconColor: "text-yellow-400",
      gradient: "from-yellow-500/5 to-transparent",
    },
    {
      label: "Interviews",
      value: stats.interviewsScheduled,
      icon: Trophy,
      href: "/dashboard/tracker",
      iconBg: "bg-green-500/10 border-green-500/20",
      iconColor: "text-green-400",
      gradient: "from-green-500/5 to-transparent",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">
          Good morning{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Here&apos;s a snapshot of your career journey.
        </p>
      </motion.div>

      {/* Portfolio unpublished banner */}
      {!portfolio?.isPublished && (
        <motion.div variants={item}>
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-magenta-500/10" />
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="relative px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Layout size={16} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text)]">Your portfolio isn&apos;t live yet</div>
                  <div className="text-xs text-[var(--text-muted)]">Publish it so recruiters can find you.</div>
                </div>
              </div>
              <Link
                href="/dashboard/portfolio"
                className="btn-brand flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs"
              >
                Build portfolio <ArrowRight size={11} weight="bold" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 overflow-hidden card-hover"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className={`relative w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${card.iconBg}`}>
              <card.icon size={17} weight="duotone" className={card.iconColor} />
            </div>
            <div className="relative text-2xl font-black tracking-tight text-[var(--text)] mb-1">
              {card.value}
            </div>
            <div className="relative text-xs text-[var(--text-muted)]">{card.label}</div>
          </Link>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent applications */}
        <motion.div variants={item} className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)]">Recent Applications</h2>
            <Link href="/dashboard/tracker" className="text-xs text-[var(--text-muted)] hover:text-cyan-400 transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {recentApplications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Briefcase size={30} className="text-[var(--text-subtle)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">No applications yet.</p>
                <Link href="/dashboard/jobs" className="mt-3 inline-flex text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                  Browse jobs →
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)] truncate">{app.job.title}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{app.job.company} · {timeAgo(app.appliedAt)}</div>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Side column */}
        <motion.div variants={item} className="space-y-4">
          {/* Saved jobs */}
          <Link
            href="/dashboard/jobs?tab=saved"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center">
                <BookmarkSimple size={15} className="text-magenta-400" weight="fill" />
              </div>
              <div className="text-sm font-bold text-[var(--text)]">Saved Jobs</div>
            </div>
            <div className="text-3xl font-black tracking-tight text-[var(--text)]">{stats.savedJobs}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
              View saved listings <ArrowRight size={10} />
            </div>
          </Link>

          {/* Portfolio live */}
          {portfolio?.isPublished && (
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-magenta-500/10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-400">Portfolio live</span>
                </div>
                <Link
                  href={`/${user.username}`}
                  target="_blank"
                  className="text-xs text-[var(--text-muted)] hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  myskillspage.com/{user.username} <ArrowRight size={10} />
                </Link>
                <div className="mt-3 text-xs text-[var(--text-subtle)] flex items-center gap-1.5">
                  <Clock size={11} /> {stats.portfolioViews} views total
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
