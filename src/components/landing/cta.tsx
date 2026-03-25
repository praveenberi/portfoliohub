"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function CtaSection() {
  return (
    <section className="py-32 bg-white border-t border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-zinc-950 rounded-[2.5rem] overflow-hidden p-12 md:p-20"
        >
          {/* Background accent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 80% at 80% 50%, rgba(34,197,94,0.12) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 max-w-2xl">
            <div className="text-xs font-semibold text-accent-500 tracking-widest uppercase mb-6">
              Get started today
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
              Your next job
              <br />
              starts with your
              <br />
              portfolio.
            </h2>
            <p className="text-base text-zinc-500 leading-relaxed max-w-[48ch] mb-10">
              Join thousands of professionals who built their portfolio, found their
              next role, and accelerated their career with PortfolioHub.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white text-sm font-semibold rounded-xl hover:bg-accent-400 active:scale-[0.98] transition-all duration-150 shadow-[0_2px_12px_rgba(34,197,94,0.3)]"
              >
                Start for free
                <ArrowRight size={16} weight="bold" />
              </Link>
              <span className="text-sm text-zinc-600">No credit card required.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
