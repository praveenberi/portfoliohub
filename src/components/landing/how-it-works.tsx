"use client";

import { motion } from "framer-motion";
import { UserPlus, Palette, MagnifyingGlass, Briefcase } from "@phosphor-icons/react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up with email or your Google account. Fill in your professional details to get started.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    step: "02",
    icon: Palette,
    title: "Build your portfolio",
    description: "Choose a template, drag in your sections, customize colors and layout. Your portfolio is live in minutes.",
    color: "text-magenta-400",
    bg: "bg-magenta-500/10 border-magenta-500/20",
  },
  {
    step: "03",
    icon: MagnifyingGlass,
    title: "Find matching jobs",
    description: "Browse curated opportunities matched to your skills. Apply with one click — portfolio and resume attached.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    step: "04",
    icon: Briefcase,
    title: "Track and land the role",
    description: "Follow every application through your dashboard. Interviews, offers, rejections — all in one timeline.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-dark-bg relative overflow-hidden">
      <div className="orb-cyan w-[500px] h-[500px] top-0 left-0 opacity-40" />
      <div className="orb-magenta w-[500px] h-[500px] bottom-0 right-0 opacity-40" />
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="mb-16">
          <div className="xp-badge xp-badge-cyan mb-6">How it works</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-white">
            From zero to hired
            <br />
            <span className="gradient-text">in four steps.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.3), rgba(224,64,251,0.3))" }} />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16,1,0.3,1] }}
              className="relative group"
            >
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 relative z-10 transition-all duration-300 group-hover:scale-110 ${step.bg}`}>
                <step.icon size={24} weight="duotone" className={step.color} />
              </div>
              <div className="text-xs font-mono text-slate-600 mb-2">{step.step}</div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
