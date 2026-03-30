"use client";

import { motion } from "framer-motion";
import {
  Layout,
  MagnifyingGlass,
  ChartBar,
  Robot,
  Globe,
  ShieldCheck,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Layout,
    title: "Drag-and-drop builder",
    description:
      "Create stunning portfolio pages without writing a single line of code. Choose templates, customize sections, and publish in minutes.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: MagnifyingGlass,
    title: "Integrated job search",
    description:
      "Search thousands of curated jobs by role, location, skills, and salary. Apply directly with your portfolio attached.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: ChartBar,
    title: "Application tracker",
    description:
      "Track every application from submission to offer. Visualize your pipeline, set reminders, and never miss a follow-up.",
    accent: "bg-orange-50 text-orange-600",
  },
  {
    icon: Robot,
    title: "AI portfolio generator",
    description:
      "Upload your resume and let AI generate a polished portfolio instantly. Smart suggestions, real-time improvements.",
    accent: "bg-accent-50 text-accent-600",
  },
  {
    icon: Globe,
    title: "Custom domain support",
    description:
      "Connect your own domain for a fully professional presence. SSL included, globally fast with CDN delivery.",
    accent: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "Analytics & privacy",
    description:
      "See who's visiting your portfolio, where they came from, and what they're viewing — without compromising user privacy.",
    accent: "bg-rose-50 text-rose-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 bg-white border-t border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header — left-aligned per taste-skill */}
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div>
            <div className="text-xs font-semibold text-accent-600 tracking-widest uppercase mb-4">
              Platform
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-950">
              Everything you need
              <br />
              <span className="text-zinc-400">to land your next role.</span>
            </h2>
          </div>
          <div className="flex items-end pb-2">
            <p className="text-zinc-500 text-base leading-relaxed max-w-[52ch]">
              myskillspage combines a professional portfolio builder, a job board,
              and an application tracker into one cohesive experience. No switching
              between tools.
            </p>
          </div>
        </div>

        {/* Feature grid — asymmetric */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-100">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: (i % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group bg-white p-8 hover:bg-zinc-50/70 transition-colors duration-200"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${feature.accent}`}
              >
                <feature.icon size={20} weight="duotone" />
              </div>
              <h3 className="font-semibold text-zinc-950 mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
