"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeSlash, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <WarningCircle size={40} className="text-red-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-zinc-950 mb-2">Invalid link</h1>
        <p className="text-sm text-zinc-500 mb-6">This reset link is invalid or has already been used.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-zinc-950 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} weight="fill" className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-zinc-950 mb-2">Password updated!</h1>
        <p className="text-sm text-zinc-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">Set new password</h1>
      <p className="text-sm text-zinc-500 mb-8">Choose a strong password with at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">Confirm password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm || password !== confirm}
          className="w-full h-10 flex items-center justify-center bg-zinc-950 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-60"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Update password"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        <Link href="/login" className="font-medium text-zinc-700 hover:text-zinc-950 transition-colors">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <Logo size={28} withText textSize="sm" />
        </Link>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
