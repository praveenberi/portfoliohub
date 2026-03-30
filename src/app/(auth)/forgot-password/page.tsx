"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSent(true);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="white" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#22c55e" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-950 tracking-tight text-sm">myskillspage</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} weight="fill" className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-zinc-950 mb-2">Check your email</h1>
            <p className="text-sm text-zinc-500 mb-6">
              If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">Forgot password?</h1>
            <p className="text-sm text-zinc-500 mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">Email address</label>
                <div className="relative">
                  <EnvelopeSimple size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-10 flex items-center justify-center bg-zinc-950 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-6">
              <Link href="/login" className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-950 transition-colors">
                <ArrowLeft size={13} />
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
