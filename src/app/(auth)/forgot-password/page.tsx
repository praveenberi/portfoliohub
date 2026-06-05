"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-[var(--bg)] relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle size="sm" />
      </div>

      {/* Ambient */}
      <div className="orb-cyan w-96 h-96 -top-20 left-1/4 animate-glow-pulse pointer-events-none fixed" />
      <div className="orb-magenta w-80 h-80 bottom-0 right-1/4 animate-glow-pulse pointer-events-none fixed" style={{ animationDelay: "1.2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        className="w-full max-w-sm relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <Logo size={36} withText textSize="xl" />
        </Link>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} weight="fill" className="text-cyan-400" />
            </div>
            <h1 className="text-xl font-black text-[var(--text)] mb-2">Check your email</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              If an account exists for <span className="font-semibold text-[var(--text)]">{email}</span>, we&apos;ve sent a reset link. Check your inbox and spam folder.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text)] mb-1">Forgot password?</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeSimple size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-brand w-full h-11 rounded-xl text-sm flex items-center justify-center mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
