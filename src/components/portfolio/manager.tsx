"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Layout,
  Eye,
  PencilSimple,
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkle,
  X,
  ArrowClockwise,
  Warning,
  Star,
} from "@phosphor-icons/react";
import type { Portfolio, Template } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AISuggestion {
  section: string;
  priority: "high" | "medium" | "low";
  title: string;
  issue: string;
  improved: string;
}

interface AIResult {
  score: number;
  summary: string;
  suggestions: AISuggestion[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

function AIModal({ result, onClose }: { result: AIResult; onClose: () => void }) {
  const [tab, setTab] = useState<"suggestions" | "seo">("suggestions");

  const priorityColor = (p: string) =>
    p === "high" ? "text-red-600 bg-red-50 border-red-200" :
    p === "medium" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    "text-zinc-500 bg-zinc-50 border-zinc-200";

  const scoreColor =
    result.score >= 75 ? "text-accent-600" :
    result.score >= 50 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90svh] sm:max-h-[85vh] flex flex-col"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center">
              <Sparkle size={16} weight="fill" className="text-accent-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-950">AI Portfolio Analysis</div>
              <div className="text-xs text-zinc-400">Powered by Claude</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${scoreColor}`}>{result.score}</div>
              <div className="text-[10px] text-zinc-400 -mt-0.5">/ 100</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
              <X size={16} className="text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100">
          <p className="text-xs text-zinc-600 leading-relaxed">{result.summary}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-1">
          {(["suggestions", "seo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === t ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              {t === "suggestions" ? `Suggestions (${result.suggestions.length})` : "SEO"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-3">
          {tab === "suggestions" ? (
            result.suggestions.map((s, i) => (
              <div key={i} className="border border-zinc-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{s.section}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(s.priority)}`}>
                      {s.priority}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-zinc-950 mb-1">{s.title}</div>
                <div className="flex items-start gap-1.5 mb-2">
                  <Warning size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-zinc-500">{s.issue}</p>
                </div>
                <div className="bg-accent-50 border border-accent-200/60 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={11} weight="fill" className="text-accent-500" />
                    <span className="text-[10px] font-semibold text-accent-700">Suggested</span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">{s.improved}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="border border-zinc-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Meta Title</div>
                <p className="text-sm font-medium text-zinc-950">{result.seo.metaTitle}</p>
                <div className="text-[10px] text-zinc-400 mt-1">{result.seo.metaTitle.length} / 60 chars</div>
              </div>
              <div className="border border-zinc-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Meta Description</div>
                <p className="text-sm text-zinc-700 leading-relaxed">{result.seo.metaDescription}</p>
                <div className="text-[10px] text-zinc-400 mt-1">{result.seo.metaDescription.length} / 160 chars</div>
              </div>
              <div className="border border-zinc-100 rounded-xl p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.seo.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-lg">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 text-center">
            Apply these suggestions in your <Link href="/dashboard/profile" className="text-accent-600 hover:underline">profile editor</Link> and <Link href="/dashboard/portfolio/builder" className="text-accent-600 hover:underline">portfolio builder</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

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
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post("/api/ai/analyze");
      if (res.data?.data) {
        setAiResult(res.data.data);
      } else {
        toast.error("AI returned no data. Try again.");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error;
      if (status === 503) toast.error("AI not configured on server.");
      else if (status === 500) toast.error(msg || "AI analysis failed — check server logs.");
      else toast.error(msg || `Error ${status ?? "unknown"}`);
    } finally {
      setAnalyzing(false);
    }
  };

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
                showup.com/{username}
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
              showup.com/{username}
            </div>
          </div>
          <Link href="/dashboard/portfolio/builder" className="block aspect-video relative group">
            <Image
              src={`https://picsum.photos/seed/${portfolio.templateId}/800/450`}
              alt="Portfolio preview"
              fill
              className="object-cover pointer-events-none"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-semibold text-zinc-950 shadow-lg group-active:scale-[0.98] transition-all">
                <PencilSimple size={14} />
                Open builder
              </span>
            </div>
          </Link>
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
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 disabled:opacity-60 rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowClockwise size={13} />
                  Run AI analysis
                </>
              )}
            </button>
          </div>

          {/* Preview — only active when published */}
          {portfolio.isPublished ? (
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
          ) : (
            <div className="flex items-center gap-3 bg-zinc-50 rounded-2xl border border-zinc-200 p-5 cursor-not-allowed">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Eye size={18} className="text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-400">View live portfolio</div>
                <div className="text-xs text-zinc-400 mt-0.5">Publish your portfolio to view it live</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {aiResult && <AIModal result={aiResult} onClose={() => setAiResult(null)} />}
      </AnimatePresence>
    </div>
  );
}
