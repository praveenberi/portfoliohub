"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeSlash, GoogleLogo, ArrowRight } from "@phosphor-icons/react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "linkedin") => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex mb-10">
            <Logo size={26} withText textClassName="text-zinc-950 text-sm" />
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-8">Sign in to your account to continue.</p>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 h-10 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <GoogleLogo size={16} weight="bold" />
              Google
            </button>
            <button
              onClick={() => handleOAuth("linkedin")}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 h-10 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-zinc-400">or continue with email</span>
            </div>
          </div>

          {/* Credentials form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Email address</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent-600 hover:text-accent-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
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
                  Sign in
                  <ArrowRight size={14} weight="bold" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-zinc-950 hover:text-accent-600 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right — visual */}
      <div className="hidden md:flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(34,197,94,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center px-12">
          <div className="text-5xl font-bold tracking-tighter text-white leading-none mb-4">
            Build once,
            <br />
            <span className="text-accent-500">impress forever.</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-[36ch] mx-auto">
            Your portfolio is your career anchor. Make it count with myskillspage.
          </p>
        </div>
      </div>
    </div>
  );
}
