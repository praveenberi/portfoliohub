"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const templates = [
  { name: "Midnight Developer", category: "Developer", seed: "dev-dark", color: "bg-zinc-950" },
  { name: "Canvas Designer", category: "Designer", seed: "designer", color: "bg-orange-500" },
  { name: "Aperture Photo", category: "Photographer", seed: "photographer", color: "bg-slate-600" },
  { name: "Growth Marketer", category: "Marketing", seed: "marketing", color: "bg-violet-600" },
  { name: "Founder Story", category: "Founder", seed: "founder", color: "bg-sky-600" },
];

export function TemplatesSection() {
  return (
    <section id="templates" className="py-32 bg-white border-t border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-16">
          <div>
            <div className="text-xs font-semibold text-accent-600 tracking-widest uppercase mb-4">
              Templates
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-950">
              Start with a
              <br />
              <span className="text-zinc-400">world-class template.</span>
            </h2>
          </div>
          <Link
            href="/templates"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            View all templates
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible scrollbar-none">
          {templates.map((t, i) => (
            <motion.div
              key={t.seed}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 w-52 md:w-auto group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 mb-3 aspect-[3/4] bg-zinc-50">
                <Image
                  src={`https://picsum.photos/seed/${t.seed}/300/400`}
                  alt={t.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold text-white ${t.color}`}>
                    {t.category}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="px-4 py-2 bg-white rounded-xl text-xs font-semibold text-zinc-950 shadow-lg">
                    Use template
                  </div>
                </div>
              </div>

              <div className="font-medium text-sm text-zinc-950 tracking-tight">{t.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{t.category}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600"
          >
            View all templates <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
