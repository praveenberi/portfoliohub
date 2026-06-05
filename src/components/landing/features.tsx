"use client";

import { motion } from "framer-motion";
import { Layout, MagnifyingGlass, ChartBar, Robot, Globe, ShieldCheck } from "@phosphor-icons/react";

const features = [
  {
    icon: Layout,
    title: "Drag-and-drop builder",
    description: "Create stunning portfolio pages without writing a single line of code. Choose templates, customize sections, and publish in minutes.",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
    glow: "group-hover:shadow-glow-cyan",
  },
  {
    icon: MagnifyingGlass,
    title: "Integrated job search",
    description: "Search thousands of curated jobs by role, location, skills, and salary. Apply directly with your portfolio attached.",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
    glow: "group-hover:shadow-glow-cyan",
  },
  {
    icon: ChartBar,
    title: "Application tracker",
    description: "Track every application from submission to offer. Visualize your pipeline, set reminders, and never miss a follow-up.",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-orange-400",
    glow: "group-hover:shadow-glow-magenta",
  },
  {
    icon: Robot,
    title: "AI portfolio generator",
    description: "Upload your resume and let AI generate a polished portfolio instantly. Smart suggestions, real-time improvements.",
    iconBg: "bg-magenta-500/10 border-magenta-500/20",
    iconColor: "text-magenta-400",
    glow: "group-hover:shadow-glow-magenta",
  },
  {
    icon: Globe,
    title: "Custom domain support",
    description: "Connect your own domain for a fully professional presence. SSL included, globally fast with CDN delivery.",
    iconBg: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-400",
    glow: "group-hover:shadow-glow-cyan",
  },
  {
    icon: ShieldCheck,
    title: "Analytics & privacy",
    description: "See who's visiting your portfolio, where they came from, and what they're viewing — without compromising user privacy.",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
    glow: "group-hover:shadow-glow-magenta",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-[var(--bg)] border-t border-[var(--border)] relative overflow-hidden">
      <div className="orb-cyan w-[600px] h-[600px] top-0 right-0 opacity-40" />
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div>
            <div className="xp-badge xp-badge-cyan mb-6">Platform</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-[var(--text)]">
              Everything you need
              <br />
              <span className="gradient-text">to land your next role.</span>
            </h2>
          </div>
          <div className="flex items-end pb-2">
            <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-[52ch]">
              myskillspage combines a professional portfolio builder, a job board, and an application tracker into one cohesive experience. No switching between tools.
            </p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16,1,0.3,1] }}
              className={`group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-7 card-hover overflow-hidden ${feature.glow}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-cyan-500/3 group-hover:to-magenta-500/3 transition-all duration-500" />
              <div className={`relative w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${feature.iconBg} transition-shadow duration-300`}>
                <feature.icon size={19} weight="duotone" className={feature.iconColor} />
              </div>
              <h3 className="relative font-bold text-[var(--text)] mb-2 tracking-tight">{feature.title}</h3>
              <p className="relative text-sm text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
