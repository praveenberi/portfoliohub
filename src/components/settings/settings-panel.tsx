"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Lock,
  Bell,
  Trash,
  FloppyDisk,
  Eye,
  EyeSlash,
  Warning,
  ArrowSquareOut,
} from "@phosphor-icons/react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
}

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Lowercase letters, numbers, hyphens, and underscores only"),
  email: z.string().email("Invalid email"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AccountFormData = z.infer<typeof accountSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "danger", label: "Danger Zone", icon: Warning },
];

export function SettingsPanel({ user }: { user: UserData | null }) {
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  async function saveAccount(data: AccountFormData) {
    setSaving(true);
    try {
      await axios.patch("/api/settings/account", data);
      toast.success("Account updated");
      router.refresh();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to save";
      toast.error(msg ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(data: PasswordFormData) {
    setSaving(true);
    try {
      await axios.patch("/api/settings/password", data);
      toast.success("Password changed");
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to change password";
      toast.error(msg ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) return;
    try {
      await axios.delete("/api/settings/account");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to delete account");
    }
  }

  const inputCls = "w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 bg-white focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your account and preferences.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 hidden md:block">
            <nav className="space-y-0.5 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                    activeTab === tab.id
                      ? tab.id === "danger"
                        ? "bg-red-50 text-red-600"
                        : "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                  }`}
                >
                  <tab.icon size={16} weight={activeTab === tab.id ? "fill" : "regular"} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "account" && (
                <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <form onSubmit={accountForm.handleSubmit(saveAccount)}>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <h2 className="text-sm font-semibold text-zinc-950">Account Information</h2>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">Display Name</label>
                        <input {...accountForm.register("name")} className={inputCls} placeholder="Your name" />
                        {accountForm.formState.errors.name && (
                          <p className="text-xs text-red-500">{accountForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">Username</label>
                        <div className="flex items-center">
                          <span className="h-10 flex items-center px-3 bg-zinc-50 border border-r-0 border-zinc-200 rounded-l-lg text-sm text-zinc-400">
                            showup.com/
                          </span>
                          <input
                            {...accountForm.register("username")}
                            className="flex-1 h-10 px-3 rounded-r-lg border border-zinc-200 text-sm text-zinc-950 bg-white focus:outline-none focus:border-zinc-400 transition-colors"
                            placeholder="yourname"
                          />
                        </div>
                        {accountForm.formState.errors.username && (
                          <p className="text-xs text-red-500">{accountForm.formState.errors.username.message}</p>
                        )}
                        {user?.username && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1">
                            Your public portfolio:{" "}
                            <a href={`/${user.username}`} target="_blank" className="text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-0.5 transition-colors">
                              /{user.username} <ArrowSquareOut size={10} />
                            </a>
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">Email Address</label>
                        <input {...accountForm.register("email")} className={inputCls} type="email" placeholder="you@example.com" />
                        {accountForm.formState.errors.email && (
                          <p className="text-xs text-red-500">{accountForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <div className="text-xs text-zinc-400">
                          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          <FloppyDisk size={16} />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <form onSubmit={passwordForm.handleSubmit(savePassword)}>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <h2 className="text-sm font-semibold text-zinc-950">Change Password</h2>
                      <p className="text-xs text-zinc-400">Leave blank if you signed in with Google or LinkedIn.</p>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">Current Password</label>
                        <div className="relative">
                          <input
                            {...passwordForm.register("currentPassword")}
                            type={showCurrent ? "text" : "password"}
                            className={`${inputCls} pr-10`}
                            placeholder="Current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          >
                            {showCurrent ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">New Password</label>
                        <div className="relative">
                          <input
                            {...passwordForm.register("newPassword")}
                            type={showNew ? "text" : "password"}
                            className={`${inputCls} pr-10`}
                            placeholder="New password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          >
                            {showNew ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-700">Confirm New Password</label>
                        <input
                          {...passwordForm.register("confirmPassword")}
                          type="password"
                          className={inputCls}
                          placeholder="Confirm new password"
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          <Lock size={16} />
                          {saving ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "danger" && (
                <motion.div key="danger" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl border border-red-100 p-6">
                    <h2 className="text-sm font-semibold text-zinc-950 mb-1">Danger Zone</h2>
                    <p className="text-xs text-zinc-500 mb-6">These actions are irreversible. Proceed with caution.</p>

                    <div className="border border-red-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
                            <Trash size={16} className="text-red-500" />
                            Delete Account
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            Permanently delete your account, portfolio, and all data. This cannot be undone.
                          </p>
                        </div>
                        <button
                          onClick={deleteAccount}
                          className="flex-shrink-0 px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
