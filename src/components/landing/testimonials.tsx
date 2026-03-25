"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "I landed three interviews in two weeks after publishing my portfolio on PortfolioHub. The drag-and-drop builder made it incredibly easy to showcase my projects.",
    name: "Marcus Rivera",
    title: "Senior Frontend Engineer at Vercel",
    seed: "marcus",
    company: "Vercel",
  },
  {
    quote:
      "The job tracker is a game-changer. I used to lose track of where I'd applied. Now I have a clear view of my entire pipeline and never miss a follow-up.",
    name: "Priya Sharma",
    title: "Product Designer at Linear",
    seed: "priya",
    company: "Linear",
  },
  {
    quote:
      "The AI portfolio generator took my messy resume and turned it into a beautiful, structured portfolio in under five minutes. I was genuinely impressed.",
    name: "Jake Novak",
    title: "Full-Stack Developer at Stripe",
    seed: "jake",
    company: "Stripe",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-16">
          <div className="text-xs font-semibold text-accent-600 tracking-widest uppercase mb-4">
            Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-950">
            Trusted by job seekers
            <br />
            <span className="text-zinc-400">who got hired.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.seed}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-card"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#22c55e">
                    <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.3 3.8 11 4.4 7.3 1.8 4.8l3.6-.5z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-sm text-zinc-700 leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 border-t border-zinc-100 pt-6">
                <Image
                  src={`https://picsum.photos/seed/${t.seed}/48/48`}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-950">{t.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
