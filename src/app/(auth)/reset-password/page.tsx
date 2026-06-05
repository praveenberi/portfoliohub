"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeSlash, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <WarningCircle size={28} weight="fill" className="text-red-400" />
        </div>
        <h1 className="text-xl font-black text-[var(--text)] mb-2">Invalid link</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">This reset link is invalid or has already been used.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/password/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={28} weight="fill" className="text-cyan-400" />
        </div>
        <h1 className="text-xl font-black text-[var(--text)] mb-2">Password updated!</h1>
        <p className="text-sm text-[var(--text-muted)]">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black tracking-tight text-[var(--text)] mb-1">Set new password</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Choose a strong password with at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required minLength={8}
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors">
              {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Confirm password</label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            className="input-field"
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm || password !== confirm}
          className="btn-brand w-full h-11 rounded-xl text-sm flex items-center justify-center mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
          ) : (
            "Update password"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        <Link href="/login" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-[var(--bg)] relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle size="sm" />
      </div>
      <div className="orb-cyan w-96 h-96 -top-20 -left-20 animate-glow-pulse pointer-events-none fixed" />
      <div className="orb-magenta w-80 h-80 bottom-0 -right-20 animate-glow-pulse pointer-events-none fixed" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        className="w-full max-w-sm relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <Logo size={36} withText textSize="xl" />
        </Link>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
