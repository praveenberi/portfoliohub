"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Eye, EyeSlash, GoogleLogo, ArrowRight,
  CheckCircle, Trophy, Rocket, Star,
} from "@phosphor-icons/react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import axios from "axios";
import { Logo } from "@/components/logo";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const perks = [
  { icon: Rocket, label: "Free portfolio builder with premium templates", color: "text-cyan-400" },
  { icon: Trophy, label: "Integrated job search across thousands of listings", color: "text-yellow-400" },
  { icon: Star,   label: "AI-powered portfolio & resume improvements", color: "text-magenta-400" },
  { icon: CheckCircle, label: "Application tracker with interview reminders", color: "text-green-400" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const it        = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };

export default function RegisterPage() {
  const router    = useRouter();
  const [showPw, setShowPw]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await axios.post("/api/auth/register", data);
      await signIn("credentials", { email: data.email, password: data.password, callbackUrl: "/onboarding" });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? "Registration failed"
        : "Something went wrong";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2 bg-[var(--bg)]">
      {/* ── Left panel ── */}
      <div className="relative hidden md:flex flex-col justify-between px-14 py-12 overflow-hidden bg-dark-bg">
        <div className="orb-cyan w-[500px] h-[500px] -top-40 -right-20 animate-glow-pulse" />
        <div className="orb-magenta w-[400px] h-[400px] -bottom-20 left-0 animate-glow-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Logo size={32} withText textSize="lg" />
          </Link>
        </div>

        {/* Hero copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.p variants={it} className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
            Join the league
          </motion.p>
          <motion.h2 variants={it} className="text-4xl font-black tracking-tighter text-white leading-[1.15] mb-8">
            Your career{" "}
            <span className="gradient-text">starts here.</span>
          </motion.h2>

          <motion.ul variants={it} className="space-y-3">
            {perks.map(({ icon: Icon, label, color }) => (
              <li key={label} className="flex items-start gap-3">
                <span className={`mt-0.5 flex-shrink-0 ${color}`}>
                  <Icon size={16} weight="fill" />
                </span>
                <span className="text-sm text-slate-400 leading-relaxed">{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <div className="relative z-10 text-[11px] text-slate-600">
          Trusted by 2,400+ professionals · Play hard, get hired.
        </div>
      </div>

      {/* ── Right panel: Form ── */}
      <div className="flex items-center justify-center px-6 py-12 bg-[var(--surface)] relative">
        <div className="absolute top-5 right-5">
          <ThemeToggle size="sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="inline-flex mb-10 md:hidden">
            <Logo size={36} withText textSize="xl" />
          </Link>

          <h1 className="text-2xl font-black tracking-tight text-[var(--text)] mb-1">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Free forever. No credit card required.</p>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-semibold text-[var(--text)] hover:border-cyan-500/50 hover:bg-[var(--hover-bg)] active:scale-[0.98] transition-all mb-5"
          >
            <GoogleLogo size={16} weight="bold" className="text-[var(--text-muted)]" />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[var(--surface)] text-xs text-[var(--text-muted)]">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Full name</label>
              <input {...register("name")} type="text" autoComplete="name" placeholder="Alex Kim" className="input-field" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-subtle)]">@</span>
                <input {...register("username")} type="text" autoComplete="username" placeholder="alexkim" className="input-field pl-7" />
              </div>
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Email</label>
              <input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
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
                <>Create account <ArrowRight size={14} weight="bold" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-5">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-[var(--text)] hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[var(--text)] hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
