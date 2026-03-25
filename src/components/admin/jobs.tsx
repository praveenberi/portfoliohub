"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, CheckCircle, XCircle, Briefcase } from "@phosphor-icons/react";
import toast from "react-hot-toast";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  workMode: string;
  type: string;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: Date;
  recruiter: { name: string | null; email: string } | null;
};

export function AdminJobsClient({
  jobs,
  total,
  page,
  limit,
}: {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const totalPages = Math.ceil(total / limit);

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/admin/jobs?${params.toString()}`);
  }

  async function updateJob(id: string, data: object) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Updated"); router.refresh(); }
    else toast.error("Failed to update");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Jobs</h1>
        <p className="text-sm text-zinc-500 mt-1">{total} total jobs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilter("q", search)}
            placeholder="Search jobs..."
            className="h-9 pl-8 pr-3 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950/10 w-56"
          />
        </div>
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => applyFilter("status", e.target.value)}
          className="h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Job</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Posted by</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden lg:table-cell">Views</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {jobs.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-400">No jobs found</td></tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.company} · {job.workMode.replace("_", " ")}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-zinc-700">{job.recruiter?.name ?? "—"}</p>
                  <p className="text-xs text-zinc-400">{job.recruiter?.email ?? "System"}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    !job.isActive ? "bg-zinc-100 text-zinc-500" :
                    job.isApproved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {!job.isActive ? "Inactive" : job.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-zinc-500">{job.views}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {!job.isApproved && job.isActive && (
                      <button
                        onClick={() => updateJob(job.id, { isApproved: true })}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle size={12} weight="fill" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => updateJob(job.id, { isActive: !job.isActive })}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      <XCircle size={12} /> {job.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => applyFilter("page", String(page - 1))}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg disabled:opacity-40 hover:bg-zinc-50"
            >Previous</button>
            <button
              disabled={page >= totalPages}
              onClick={() => applyFilter("page", String(page + 1))}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg disabled:opacity-40 hover:bg-zinc-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
