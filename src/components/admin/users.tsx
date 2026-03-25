"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MagnifyingGlass, ProhibitInset, CheckCircle, Trash } from "@phosphor-icons/react";
import { timeAgo } from "@/lib/utils";
import type { User } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface AdminUsersProps {
  users: (User & {
    _count: { applications: number };
    portfolio: { isPublished: boolean } | null;
  })[];
  total: number;
  page: number;
  limit: number;
}

export function AdminUsers({ users, total, page, limit }: AdminUsersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSuspend = async (userId: string, isActive: boolean) => {
    setProcessing(userId);
    try {
      await axios.patch(`/api/admin/users/${userId}`, { isActive: !isActive });
      toast.success(isActive ? "User suspended" : "User reactivated");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">{total.toLocaleString()} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-72">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search users..."
          onChange={(e) => {
            const params = new URLSearchParams({ q: e.target.value });
            startTransition(() => router.push(`${pathname}?${params}`));
          }}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-accent-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Portfolio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Applications</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-950">{user.name ?? "—"}</div>
                      <div className="text-xs text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    user.role === "ADMIN" ? "bg-zinc-950 text-white" :
                    user.role === "RECRUITER" ? "bg-blue-50 text-blue-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>
                    {user.role.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.portfolio ? (
                    <span className={`text-xs font-medium ${user.portfolio.isPublished ? "text-accent-600" : "text-zinc-400"}`}>
                      {user.portfolio.isPublished ? "Published" : "Draft"}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-300">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600">{user._count.applications}</td>
                <td className="px-6 py-4 text-xs text-zinc-400">{timeAgo(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-accent-500" : "bg-zinc-300"}`} />
                    <span className="text-xs text-zinc-500">{user.isActive ? "Active" : "Suspended"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSuspend(user.id, user.isActive)}
                    disabled={processing === user.id || user.role === "ADMIN"}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"
                    title={user.isActive ? "Suspend user" : "Reactivate user"}
                  >
                    {user.isActive ? (
                      <ProhibitInset size={15} className="text-zinc-400" />
                    ) : (
                      <CheckCircle size={15} className="text-accent-500" />
                    )}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link href={`${pathname}?page=${page - 1}`} className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              Previous
            </Link>
          )}
          {page * limit < total && (
            <Link href={`${pathname}?page=${page + 1}`} className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
