"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, ChartLineUp, Layout } from "@phosphor-icons/react";
import Image from "next/image";

interface HeroProps {
  stats: { templates: number; users: number; jobs: number };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function HeroSection({ stats }: HeroProps) {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-zinc-50 pt-16">
      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(34,197,94,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 100% 80%, rgba(14,165,233,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 w-full py-24 md:py-0">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left column — text */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              Now with AI portfolio generation
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-5xl md:text-6xl font-bold tracking-tighter leading-none text-zinc-950 mb-6"
            >
              Your portfolio,
              <br />
              <span className="text-zinc-400">your career,</span>
              <br />
              one platform.
            </motion.h1>

            {/* Body */}
            <motion.p
              variants={item}
              className="text-base text-zinc-500 leading-relaxed max-w-[52ch] mb-10"
            >
              Build a stunning portfolio website in minutes, search thousands of jobs,
              and track every application from a single dashboard. Built for serious
              job seekers.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex items-center gap-4 mb-14">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              >
                Build your portfolio
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 text-zinc-700 text-sm font-medium border border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-white active:scale-[0.98] transition-all duration-150"
              >
                Browse jobs
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="flex items-center gap-8 border-t border-zinc-200 pt-8">
              {[
                { label: "Portfolios live", value: `${(stats.users * 0.6).toFixed(0)}+` },
                { label: "Active jobs", value: `${stats.jobs}+` },
                { label: "Templates", value: `${stats.templates}+` },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold tracking-tight text-zinc-950">{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column — UI preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden md:block"
          >
            {/* Main card */}
            <div className="relative z-10 bg-white rounded-[2rem] border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <div className="ml-4 flex-1 bg-zinc-100 rounded-md h-5 max-w-[200px] text-zinc-400 text-[10px] flex items-center px-2">
                  showup.com/alexkim
                </div>
              </div>

              {/* Portfolio preview */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Image
                    src="https://picsum.photos/seed/alex/80/80"
                    alt="Portfolio preview"
                    width={56}
                    height={56}
                    className="rounded-xl"
                  />
                  <div>
                    <div className="h-4 w-28 bg-zinc-950 rounded-full" />
                    <div className="h-3 w-20 bg-zinc-300 rounded-full mt-1.5" />
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-accent-50 border border-accent-200">
                    <div className="h-3 w-12 bg-accent-500 rounded-full" />
                  </div>
                </div>

                {/* Skills chips */}
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "AWS", "PostgreSQL"].map((s) => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Project cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { seed: "project1", title: "E-Commerce App" },
                    { seed: "project2", title: "Analytics Dashboard" },
                  ].map((p) => (
                    <div key={p.seed} className="rounded-xl overflow-hidden border border-zinc-100">
                      <Image
                        src={`https://picsum.photos/seed/${p.seed}/240/120`}
                        alt={p.title}
                        width={240}
                        height={120}
                        className="w-full object-cover"
                      />
                      <div className="p-2.5">
                        <div className="h-3 w-24 bg-zinc-800 rounded-full" />
                        <div className="h-2.5 w-16 bg-zinc-200 rounded-full mt-1" />
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
              className="absolute -left-8 top-12 bg-white rounded-2xl border border-zinc-200 shadow-card p-4 w-48"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                  <ChartLineUp size={16} className="text-accent-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-950">47 views</div>
                  <div className="text-[10px] text-zinc-400">This week</div>
                </div>
              </div>
              <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-accent-500 rounded-full" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-6 bottom-16 bg-white rounded-2xl border border-zinc-200 shadow-card p-4 w-52"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Briefcase size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-950">Interview today</div>
                  <div className="text-[10px] text-zinc-400">Vercel · 2:00 PM</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-8 -top-6 bg-zinc-950 text-white rounded-2xl border border-zinc-800 shadow-card p-4 w-44"
            >
              <div className="flex items-center gap-2 mb-1">
                <Layout size={14} className="text-accent-400" />
                <span className="text-xs font-semibold">Portfolio live</span>
              </div>
              <div className="text-[10px] text-zinc-400">3 recruiters viewed</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
