"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ArrowRight, Briefcase, ChartLineUp, Layout, Lightning, Trophy, Sparkle } from "@phosphor-icons/react";
import Image from "next/image";

interface HeroProps {
  stats: { templates: number; users: number; jobs: number };
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item      = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } };

export function HeroSection({ stats }: HeroProps) {
  const { data: session } = useSession();
  const jobsHref = session ? "/dashboard/jobs" : `/login?callbackUrl=${encodeURIComponent("/dashboard/jobs")}`;

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden pt-16 bg-[var(--bg)]">
      {/* Ambient orbs */}
      <div className="orb-cyan w-[700px] h-[700px] -top-48 -left-48 animate-glow-pulse" style={{ animationDuration: "4s" }} />
      <div className="orb-magenta w-[600px] h-[600px] top-1/3 -right-48 animate-glow-pulse" style={{ animationDelay: "1.5s", animationDuration: "5s" }} />

      {/* Grid background */}
      <div className="absolute inset-0 line-grid opacity-50 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 w-full py-24 md:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-8 tracking-wide">
              <Sparkle size={12} weight="fill" />
              Now with AI portfolio generation
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.08] text-[var(--text)] mb-6">
              Turn the job hunt into{" "}
              <span className="gradient-text-animated">a game you win.</span>
            </motion.h1>

            {/* Body */}
            <motion.p variants={item} className="text-base text-[var(--text-muted)] leading-relaxed max-w-[50ch] mb-10">
              Earn XP for every application. Climb the leaderboard. Build a stunning portfolio and track every job from one powerful dashboard.
            </motion.p>

            {/* XP perk chips */}
            <motion.div variants={item} className="flex flex-wrap gap-2 mb-10">
              {[
                { icon: Lightning, label: "+20 XP / apply",  color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/20"    },
                { icon: Trophy,    label: "Daily streaks",    color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
                { icon: Sparkle,   label: "Real rewards",     color: "text-magenta-400",bg: "bg-magenta-400/10 border-magenta-400/20"},
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold text-[var(--text)] ${bg}`}>
                  <Icon size={13} className={color} weight="fill" />
                  {label}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="flex items-center gap-4 mb-14">
              <Link href="/register" className="btn-brand inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
                Build your portfolio <ArrowRight size={15} weight="bold" />
              </Link>
              <Link
                href={jobsHref}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] rounded-xl hover:border-cyan-500/40 hover:text-[var(--text)] hover:bg-[var(--hover-bg)] active:scale-[0.98] transition-all duration-150"
              >
                Browse jobs
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="flex items-center gap-8 border-t border-[var(--border)] pt-8">
              {[
                { label: "Portfolios live", value: `${Math.round(stats.users * 0.6)}+` },
                { label: "Active jobs",     value: `${stats.jobs}+`                    },
                { label: "Templates",       value: `${stats.templates}+`               },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black tracking-tight text-[var(--text)]">{stat.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column — UI preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16,1,0.3,1] }}
            className="relative hidden md:block"
          >
            {/* Main card */}
            <div className="relative z-10 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-dark-card overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <div className="ml-4 flex-1 bg-[var(--border)] rounded-md h-5 max-w-[200px] text-[var(--text-subtle)] text-[10px] flex items-center px-2">
                  myskillspage.com/alexkim
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Image src="https://picsum.photos/seed/alex/80/80" alt="Portfolio preview" width={56} height={56} className="rounded-xl" />
                  <div>
                    <div className="h-4 w-28 bg-[var(--text)] rounded-full opacity-80" />
                    <div className="h-3 w-20 bg-[var(--border)] rounded-full mt-1.5" />
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <div className="h-3 w-12 bg-cyan-500 rounded-full" />
                  </div>
                </div>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "AWS", "PostgreSQL"].map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-[var(--muted)] border border-[var(--border)] text-[var(--text-muted)] rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Project cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[{ seed: "project1", title: "E-Commerce App" }, { seed: "project2", title: "Analytics Dashboard" }].map((p) => (
                    <div key={p.seed} className="rounded-xl overflow-hidden border border-[var(--border)]">
                      <Image src={`https://picsum.photos/seed/${p.seed}/240/120`} alt={p.title} width={240} height={120} className="w-full object-cover" />
                      <div className="p-2.5">
                        <div className="h-3 w-24 bg-[var(--text)] rounded-full opacity-70" />
                        <div className="h-2.5 w-16 bg-[var(--border)] rounded-full mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-dark-card p-4 w-48"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <ChartLineUp size={15} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">47 views</div>
                  <div className="text-[10px] text-[var(--text-subtle)]">This week</div>
                </div>
              </div>
              <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full w-2/3 rounded-full" style={{ background: "linear-gradient(90deg, #00d4ff, #e040fb)" }} />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-6 bottom-16 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-dark-card p-4 w-52"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center">
                  <Briefcase size={15} className="text-magenta-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Interview today</div>
                  <div className="text-[10px] text-[var(--text-subtle)]">Vercel · 2:00 PM</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-8 -top-6 rounded-2xl border border-cyan-500/25 bg-[var(--card)] shadow-glow-cyan p-4 w-44"
            >
              <div className="flex items-center gap-2 mb-1">
                <Layout size={13} className="text-cyan-400" />
                <span className="text-xs font-bold text-[var(--text)]">Portfolio live</span>
              </div>
              <div className="text-[10px] text-[var(--text-subtle)]">3 recruiters viewed</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
