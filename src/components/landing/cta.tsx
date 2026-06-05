"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "@phosphor-icons/react";

export function CtaSection() {
  return (
    <section className="py-32 bg-[var(--bg)] border-t border-[var(--border)] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          className="relative rounded-[2.5rem] overflow-hidden p-12 md:p-20 border border-cyan-500/20"
          style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(224,64,251,0.08) 100%)" }}
        >
          {/* Ambient orbs */}
          <div className="orb-cyan w-[500px] h-[500px] -top-32 -right-32 animate-glow-pulse" />
          <div className="orb-magenta w-[400px] h-[400px] -bottom-32 -left-32 animate-glow-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 dot-grid opacity-30" />

          <div className="relative z-10 max-w-2xl">
            <div className="xp-badge xp-badge-cyan mb-6">
              <Rocket size={10} weight="fill" />
              Get started today
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.08] text-[var(--text)] mb-6">
              Your next job starts
              <br />
              <span className="gradient-text-animated">with your portfolio.</span>
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-[48ch] mb-10">
              Join thousands of professionals who built their portfolio, found their next role, and accelerated their career with myskillspage.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register" className="btn-brand inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm">
                Start for free <ArrowRight size={15} weight="bold" />
              </Link>
              <span className="text-sm text-[var(--text-muted)]">No credit card required.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
