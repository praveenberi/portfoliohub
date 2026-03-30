"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeSlash, GoogleLogo, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import axios from "axios";
import { Logo } from "@/components/logo";
import toast from "react-hot-toast";

const perks = [
  "Free portfolio builder with premium templates",
  "Integrated job search across thousands of listings",
  "Application tracker with interview reminders",
  "AI-powered portfolio & resume improvements",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await axios.post("/api/auth/register", data);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/onboarding",
      });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? "Registration failed"
        : "Something went wrong";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      {/* Left — visual */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-950 px-12 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 20% 80%, rgba(34,197,94,0.1) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <Link href="/" className="inline-flex">
            <Logo size={26} withText textSize="sm" />
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tighter text-white leading-none mb-8">
            Your career
            <br />
            <span className="text-accent-500">starts here.</span>
          </h2>

          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <CheckCircle size={18} weight="fill" className="text-accent-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-zinc-400 leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-zinc-700">
          Trusted by 2,400+ professionals
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10 md:hidden">
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

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-8">Free forever. No credit card required.</p>

          {/* OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all mb-4"
          >
            <GoogleLogo size={16} weight="bold" />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-zinc-400">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Full name</label>
              <input
                {...register("name")}
                type="text"
                autoComplete="name"
                placeholder="Alex Kim"
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">@</span>
                <input
                  {...register("username")}
                  type="text"
                  autoComplete="username"
                  placeholder="alexkim"
                  className="w-full h-10 pl-7 pr-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                />
              </div>
              {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Email address</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-950 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={14} weight="bold" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-zinc-700 hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-zinc-700 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-950 hover:text-accent-600 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
