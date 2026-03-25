"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Layout,
  Eye,
  PencilSimple,
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react";
import type { Portfolio, Template } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PortfolioManagerProps {
  portfolio: (Portfolio & { template: Template | null }) | null;
  templates: Template[];
  username: string;
}

export function PortfolioManager({ portfolio, templates, username }: PortfolioManagerProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(
    portfolio?.templateId ?? templates[0]?.id ?? ""
  );
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleCreatePortfolio = async () => {
    setCreating(true);
    try {
      await axios.post("/api/portfolios", { templateId: selectedTemplate });
      toast.success("Portfolio created!");
      router.refresh();
    } catch {
      toast.error("Failed to create portfolio");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!portfolio) return;
    setPublishing(true);
    try {
      await axios.patch(`/api/portfolios/${portfolio.id}`, {
        isPublished: !portfolio.isPublished,
      });
      toast.success(portfolio.isPublished ? "Portfolio unpublished" : "Portfolio published!");
      router.refresh();
    } catch {
      toast.error("Failed to update portfolio");
    } finally {
      setPublishing(false);
    }
  };

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Create your portfolio</h1>
          <p className="text-sm text-zinc-500 mt-1">Choose a template to get started.</p>
        </div>

        {/* Template grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => {
            const config = t.config as { thumbnailUrl?: string; primaryColor?: string };
            const isSelected = selectedTemplate === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left rounded-2xl border-2 transition-all duration-150 overflow-hidden ${
                  isSelected
                    ? "border-accent-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="aspect-video relative bg-zinc-100">
                  <Image
                    src={`https://picsum.photos/seed/${t.slug}/400/225`}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} weight="fill" className="text-accent-500 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm text-zinc-950">{t.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{t.category}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleCreatePortfolio}
          disabled={!selectedTemplate || creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {creating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create portfolio
              <ArrowRight size={14} weight="bold" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{portfolio.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {portfolio.isPublished ? (
              <div className="flex items-center gap-1.5 text-xs text-accent-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                Published
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                Draft
              </div>
            )}
            {portfolio.isPublished && (
              <Link
                href={`/${username}`}
                target="_blank"
                className="text-xs text-zinc-500 hover:text-zinc-950 flex items-center gap-1 transition-colors"
              >
                <Globe size={12} />
                portfoliohub.com/{username}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all active:scale-[0.98] ${
              portfolio.isPublished
                ? "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                : "bg-accent-500 text-white border-transparent hover:bg-accent-400"
            }`}
          >
            {publishing ? "..." : portfolio.isPublished ? "Unpublish" : "Publish"}
          </button>

          <Link
            href="/dashboard/portfolio/builder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <PencilSimple size={14} />
            Edit
          </Link>
        </div>
      </div>

      {/* Stats + preview grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            <div className="ml-3 flex-1 bg-zinc-100 rounded-md h-5 max-w-[200px] flex items-center px-2 text-zinc-400 text-[10px]">
              portfoliohub.com/{username}
            </div>
          </div>
          <div className="aspect-video relative">
            <Image
              src={`https://picsum.photos/seed/${portfolio.templateId}/800/450`}
              alt="Portfolio preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Link
                href="/dashboard/portfolio/builder"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-semibold text-zinc-950 shadow-lg hover:bg-zinc-50 active:scale-[0.98] transition-all"
              >
                <PencilSimple size={14} />
                Open builder
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-sm font-semibold text-zinc-950 mb-4">Portfolio stats</div>
            <div className="space-y-3">
              {[
                { label: "Total views", value: portfolio.views },
                { label: "Sections", value: Array.isArray(portfolio.sections) ? (portfolio.sections as unknown[]).length : 0 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{stat.label}</span>
                  <span className="text-sm font-semibold text-zinc-950">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI feature */}
          <div className="bg-zinc-950 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={16} className="text-accent-400" />
              <span className="text-sm font-semibold text-white">AI improvements</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Let AI analyze your portfolio and suggest improvements to get more recruiter attention.
            </p>
            <button className="w-full py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors border border-white/10">
              Run AI analysis
            </button>
          </div>

          {/* Preview */}
          <Link
            href={`/${username}`}
            target="_blank"
            className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Eye size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-950">View live portfolio</div>
              <div className="text-xs text-zinc-400 mt-0.5">Opens in new tab</div>
            </div>
            <ArrowRight size={14} className="text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
