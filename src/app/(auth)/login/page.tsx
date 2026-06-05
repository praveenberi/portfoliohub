"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeSlash, GoogleLogo, ArrowRight, Lightning, Fire, Gift } from "@phosphor-icons/react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const perks = [
  { icon: Lightning, label: "+20 XP / apply",   color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: Fire,      label: "Daily streaks",     color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: Gift,      label: "Real rewards",      color: "text-magenta-400", bg: "bg-magenta-400/10 border-magenta-400/20" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };

export default function LoginPage() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const callbackUrl   = searchParams.get("callbackUrl") ?? "/dashboard";
  const [showPw, setShowPw]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (res?.error) toast.error("Invalid email or password");
      else { router.push(callbackUrl); router.refresh(); }
    } finally { setIsLoading(false); }
  };

  const handleOAuth = async (provider: "google") => {
    setOAuthLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2 bg-[var(--bg)]">
      {/* ── Left panel ── */}
      <div className="relative hidden md:flex flex-col justify-between px-14 py-12 overflow-hidden bg-dark-bg">
        {/* Ambient orbs */}
        <div className="orb-cyan w-[500px] h-[500px] -top-40 -left-32 animate-glow-pulse" />
        <div className="orb-magenta w-[400px] h-[400px] bottom-0 right-0 animate-glow-pulse" style={{ animationDelay: "1.2s" }} />
        {/* Grid */}
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Top: Logo + theme toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/">
            <Logo size={32} withText textSize="lg" />
          </Link>
        </div>

        {/* Center: Hero copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.p variants={item} className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
            Career · Gamified
          </motion.p>
          <motion.h1 variants={item} className="text-5xl font-black tracking-tighter leading-[1.1] text-white mb-6">
            Turn the job hunt into{" "}
            <span className="gradient-text">a game you win.</span>
          </motion.h1>
          <motion.p variants={item} className="text-slate-400 text-sm leading-relaxed max-w-[44ch] mb-10">
            Earn XP for every application. Climb the leaderboard. Unlock real‑world rewards from partner brands.
          </motion.p>

          {/* XP perk chips */}
          <motion.div variants={item} className="flex flex-wrap gap-3">
            {perks.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${bg} backdrop-blur-sm`}>
                <Icon size={16} className={color} weight="fill" />
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-slate-600">
          © myskillspage · Play hard, get hired.
        </div>
      </div>

      {/* ── Right panel: Form ── */}
      <div className="flex items-center justify-center px-6 py-12 bg-[var(--surface)] relative">
        {/* Top-right theme toggle */}
        <div className="absolute top-5 right-5">
          <ThemeToggle size="sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/" className="inline-flex mb-10 md:hidden">
            <Logo size={36} withText textSize="xl" />
          </Link>

          <h1 className="text-2xl font-black tracking-tight text-[var(--text)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Sign in to continue your journey.</p>

          {/* Google OAuth */}
          <button
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-semibold text-[var(--text)] hover:border-cyan-500/50 hover:bg-[var(--hover-bg)] active:scale-[0.98] transition-all disabled:opacity-50 mb-5"
          >
            {oauthLoading === "google" ? (
              <div className="w-4 h-4 border-2 border-[var(--text-subtle)] border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              <GoogleLogo size={16} weight="bold" className="text-[var(--text-muted)]" />
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[var(--surface)] text-xs text-[var(--text-muted)]">or continue with email</span>
            </div>
          </div>

          {/* Credentials form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
                >
                  {showPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-brand w-full h-11 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={14} weight="bold" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
