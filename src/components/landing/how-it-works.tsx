"use client";

import { motion } from "framer-motion";
import { UserPlus, Palette, Rocket, Briefcase } from "@phosphor-icons/react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up with email or your Google/LinkedIn account. Fill in your professional details to get started.",
  },
  {
    step: "02",
    icon: Palette,
    title: "Build your portfolio",
    description:
      "Choose a template, drag in your sections, customize colors and layout. Your portfolio is live in minutes.",
  },
  {
    step: "03",
    icon: MagnifyingGlass,
    title: "Find matching jobs",
    description:
      "Browse curated opportunities matched to your skills. Apply with one click — portfolio and resume attached.",
  },
  {
    step: "04",
    icon: Briefcase,
    title: "Track and land the role",
    description:
      "Follow every application through your dashboard. Interviews, offers, rejections — all in one timeline.",
  },
];

import { MagnifyingGlass } from "@phosphor-icons/react";

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-zinc-950">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-16">
          <div className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-white">
            From zero to hired
            <br />
            <span className="text-zinc-600">in four steps.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-zinc-800" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              {/* Step number */}
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 relative z-10">
                <step.icon size={24} weight="duotone" className="text-accent-500" />
              </div>
              <div className="text-xs font-mono text-zinc-700 mb-2">{step.step}</div>
              <h3 className="text-base font-semibold text-white mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
