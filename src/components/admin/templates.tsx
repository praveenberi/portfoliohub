"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Eye, EyeSlash } from "@phosphor-icons/react";
import toast from "react-hot-toast";

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  order: number;
  _count: { portfolios: number };
};

export function AdminTemplatesClient({ templates }: { templates: Template[] }) {
  const router = useRouter();

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) { toast.success("Updated"); router.refresh(); }
    else toast.error("Failed to update");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Templates</h1>
        <p className="text-sm text-zinc-500 mt-1">{templates.length} templates</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Template</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Usage</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {templates.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-400">No templates found</td></tr>
            )}
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.slug} {t.isPremium && <span className="ml-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">Premium</span>}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-zinc-600 capitalize">{t.category.toLowerCase()}</td>
                <td className="px-4 py-3 hidden md:table-cell text-zinc-500">{t._count.portfolios} portfolios</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(t.id, t.isActive)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    {t.isActive ? <><EyeSlash size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
