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
  Check,
} from "@phosphor-icons/react";
import type { Portfolio, Template } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface AISuggestion {
  section: string;
  priority: "high" | "medium" | "low";
  title: string;
  issue: string;
  improved: string;
}

export interface AIResult {
  score: number;
  summary: string;
  suggestions: AISuggestion[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// ── Section matching ──────────────────────────────────────────────────────────
// Maps an AI suggestion's `section` string to a builder section type.
export function sectionKey(s: string): string {
  return (s || "").toLowerCase().trim();
}

export function matchesSectionType(suggestionSection: string, sectionType: string): boolean {
  const s = sectionKey(suggestionSection);
  const t = sectionKey(sectionType);
  if (t === "about") return ["bio", "about", "summary"].includes(s);
  if (t === "hero") return ["headline", "title", "tagline", "hero"].includes(s);
  if (t === "skills") return s === "skills";
  if (t === "experience") return ["experience", "work", "work experience"].includes(s);
  if (t === "projects") return ["projects", "project"].includes(s);
  if (t === "education") return s === "education";
  if (t === "certifications") return ["certifications", "certs", "certification"].includes(s);
  if (t === "contact") return ["contact", "contact info"].includes(s);
  if (t === "testimonials") return ["testimonials", "recommendations"].includes(s);
  if (t === "extras") return ["extras", "awards", "publications", "languages", "volunteer"].includes(s);
  return s === t;
}

// ── Apply helper (shared by modal and inline panel) ──────────────────────────
// Returns true if it was applied to the profile directly, false if the
// suggestion targeted a section (experience, projects, ...) that isn't
// patchable as a single field — in that case the text is copied to the
// clipboard and the profile editor is opened in a new tab.
export async function applySuggestionToProfile(section: string, improved: string): Promise<boolean> {
  const key = sectionKey(section);
  if (key === "bio" || key === "about" || key === "summary") {
    await axios.patch("/api/profile", { bio: improved.slice(0, 2000) });
    return true;
  }
  if (key === "headline" || key === "title" || key === "tagline") {
    await axios.patch("/api/profile", { headline: improved.slice(0, 160) });
    return true;
  }
  if (key === "skills") {
    const items = improved
      .split(/[,|•\n]/)
      .map((s) => s.replace(/^[\s\-•#]+|[\s.]+$/g, "").trim())
      .filter((s) => s.length > 0 && s.length < 40);
    if (items.length === 0) throw new Error("No parseable skills in suggestion");
    const existing = (await axios.get("/api/profile")).data?.data?.skills;
    const existingArr: string[] = Array.isArray(existing)
      ? existing
      : typeof existing === "string"
      ? JSON.parse(existing || "[]")
      : [];
    const seen = new Set(existingArr.map((s) => s.toLowerCase()));
    const merged = [...existingArr];
    for (const item of items) {
      if (!seen.has(item.toLowerCase())) {
        merged.push(item);
        seen.add(item.toLowerCase());
      }
    }
    await axios.patch("/api/profile", { skills: merged });
    return true;
  }
  try {
    await navigator.clipboard.writeText(improved);
  } catch {
    // clipboard unavailable — fall through
  }
  window.open("/dashboard/profile", "_blank");
  return false;
}

// Map a suggestion's section + edited text to a builder section content patch.
// The returned object is merged into `section.content` so the change is visible
// in the preview and is saved on Publish.
export function buildSectionContentPatch(
  sectionType: string,
  text: string
): Record<string, unknown> | null {
  const t = sectionKey(sectionType);
  if (t === "about") return { bioOverride: text };
  if (t === "skills") return { customSkills: text };
  if (t === "hero") return null; // hero text comes from profile.headline
  // For list-based sections, store as an `intro` paragraph rendered above the list.
  if (
    t === "projects" ||
    t === "experience" ||
    t === "education" ||
    t === "certifications" ||
    t === "contact" ||
    t === "extras" ||
    t === "testimonials" ||
    t === "social"
  ) {
    return { intro: text };
  }
  return { intro: text };
}

// ── Editable apply popup ─────────────────────────────────────────────────────
export function SuggestionEditPopup({
  suggestion,
  sectionType,
  onApplyToSection,
  onApplied,
  onClose,
}: {
  suggestion: AISuggestion;
  /** Builder section type the popup is being applied to (about, skills, projects, ...). Falls back to suggestion.section. */
  sectionType?: string;
  /** Optional callback to merge a content patch into the builder's section.content. */
  onApplyToSection?: (patch: Record<string, unknown>) => void;
  onApplied: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(suggestion.improved);
  const [saving, setSaving] = useState(false);
  const targetType = sectionKey(sectionType ?? suggestion.section);
  const isSkills = targetType === "skills";

  function insertSkillsHeading(prefix: string) {
    const sep = text && !text.endsWith("\n") ? "\n\n" : text ? "\n" : "";
    setText(`${text}${sep}${prefix} New section\nSkill 1, Skill 2`);
  }

  async function handleApply() {
    if (!text.trim()) {
      toast.error("Content can't be empty");
      return;
    }
    setSaving(true);
    try {
      // 1) Push the edit into the builder's section content (so preview reflects it).
      const patch = onApplyToSection
        ? buildSectionContentPatch(sectionType ?? suggestion.section, text)
        : null;
      if (patch && onApplyToSection) onApplyToSection(patch);

      // 2) Best-effort: also patch the underlying profile field where applicable
      //    (bio / headline / skills). Failures are non-fatal because the section
      //    content patch above is the user-visible source of truth in the builder.
      let profilePatched = false;
      try {
        profilePatched = await applySuggestionToProfile(suggestion.section, text);
      } catch {
        // ignore — section content already updated
      }

      if (patch || profilePatched) {
        toast.success("Applied — click Publish to make it live");
      } else {
        toast.success(`Copied — paste into the ${suggestion.section} section in Profile`);
      }
      onApplied();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e?.response?.data?.error || e?.message || "Failed to apply");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[90svh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center">
              <Sparkle size={14} weight="fill" className="text-accent-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-950">Edit suggestion</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{suggestion.section}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
            <X size={16} className="text-zinc-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-zinc-950 mb-1">{suggestion.title}</div>
            <div className="flex items-start gap-1.5">
              <Warning size={12} className="text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500">{suggestion.issue}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Suggested content — edit before applying
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={isSkills ? 8 : 10}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none"
            />
            {isSkills && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => insertSkillsHeading("##")}
                  className="py-1.5 rounded-lg border border-zinc-200 text-[11px] font-medium text-zinc-600 hover:border-accent-400 hover:text-accent-700 hover:bg-accent-50 transition-all"
                >
                  + Add section
                </button>
                <button
                  type="button"
                  onClick={() => insertSkillsHeading("###")}
                  className="py-1.5 rounded-lg border border-zinc-200 text-[11px] font-medium text-zinc-600 hover:border-accent-400 hover:text-accent-700 hover:bg-accent-50 transition-all"
                >
                  + Add sub-section
                </button>
              </div>
            )}
            <p className="text-[10px] text-zinc-400">
              {isSkills
                ? "Use ## for section headers and ### for sub-sections. Comma-separate skills below each heading."
                : targetType === "about"
                ? "Saved into the About section's bio (overrides your profile bio in this portfolio)."
                : targetType === "hero"
                ? "Updates your profile headline."
                : "Saved as an intro paragraph above the list in this section."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-accent-500 hover:bg-accent-400 active:scale-[0.98] disabled:opacity-60 rounded-lg transition-all"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Applying
              </>
            ) : (
              <>
                <Check size={12} weight="bold" /> Apply
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Inline per-section suggestions card ──────────────────────────────────────
export function SectionAISuggestions({
  suggestions,
  sectionType,
  appliedIds,
  onAppliedId,
  onApplyToSection,
}: {
  suggestions: AISuggestion[];
  sectionType: string;
  appliedIds: Set<string>;
  onAppliedId: (id: string) => void;
  /** Merges a content patch into the builder's section.content for this section. */
  onApplyToSection?: (patch: Record<string, unknown>) => void;
}) {
  const relevant = suggestions
    .map((s, i) => ({ s, id: `${sectionType}-${i}` }))
    .filter(({ s }) => matchesSectionType(s.section, sectionType));
  const [editing, setEditing] = useState<{ suggestion: AISuggestion; id: string } | null>(null);

  if (relevant.length === 0) return null;

  const priorityColor = (p: string) =>
    p === "high" ? "text-red-600 bg-red-50 border-red-200" :
    p === "medium" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    "text-zinc-500 bg-zinc-50 border-zinc-200";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Sparkle size={11} weight="fill" className="text-accent-500" />
        <span className="text-[10px] font-semibold text-accent-700 uppercase tracking-wider">
          AI suggestions ({relevant.length})
        </span>
      </div>
      {relevant.map(({ s, id }) => {
        const applied = appliedIds.has(id);
        return (
          <div key={id} className="rounded-lg border border-accent-200/60 bg-accent-50/40 p-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(s.priority)}`}>
                {s.priority}
              </span>
              {applied ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-700">
                  <Check size={10} weight="bold" /> Applied
                </span>
              ) : (
                <button
                  onClick={() => setEditing({ suggestion: s, id })}
                  className="flex items-center gap-1 text-[10px] font-semibold text-white bg-accent-500 hover:bg-accent-400 active:scale-[0.98] px-2 py-0.5 rounded-md transition-all"
                >
                  <Check size={10} weight="bold" /> Apply
                </button>
              )}
            </div>
            <div className="text-[11px] font-semibold text-zinc-950 mb-0.5">{s.title}</div>
            <p className="text-[10px] text-zinc-500 line-clamp-2">{s.issue}</p>
          </div>
        );
      })}
      <AnimatePresence>
        {editing && (
          <SuggestionEditPopup
            suggestion={editing.suggestion}
            sectionType={sectionType}
            onApplyToSection={onApplyToSection}
            onApplied={() => onAppliedId(editing.id)}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function AIModal({ result, onClose }: { result: AIResult; onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"suggestions" | "seo">("suggestions");
  const [applied, setApplied] = useState<Record<number, "applied">>({});
  const [applying, setApplying] = useState<number | null>(null);

  async function applySuggestion(index: number, section: string, improved: string) {
    setApplying(index);
    try {
      const patched = await applySuggestionToProfile(section, improved);
      setApplied((prev) => ({ ...prev, [index]: "applied" }));
      if (patched) {
        toast.success("Applied — click Publish to make it live");
        router.refresh();
      } else {
        toast.success(`Copied to clipboard — paste into the ${section} section in your Profile`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e?.response?.data?.error || e?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  }

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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <Star size={11} weight="fill" className="text-accent-500" />
                      <span className="text-[10px] font-semibold text-accent-700">Suggested</span>
                    </div>
                    {applied[i] === "applied" ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-700 px-2 py-1">
                        <Check size={11} weight="bold" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => applySuggestion(i, s.section, s.improved)}
                        disabled={applying === i}
                        className="flex items-center gap-1 text-[10px] font-semibold text-white bg-accent-500 hover:bg-accent-400 active:scale-[0.98] disabled:opacity-60 px-2.5 py-1 rounded-md transition-all"
                      >
                        {applying === i ? (
                          <>
                            <div className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Applying
                          </>
                        ) : (
                          <>
                            <Check size={11} weight="bold" /> Apply
                          </>
                        )}
                      </button>
                    )}
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
    // Require a username before publishing
    if (!portfolio.isPublished && !username?.trim()) {
      toast.error("Set a username in Settings → Account before publishing");
      router.push("/dashboard/settings");
      return;
    }
    setPublishing(true);
    try {
      await axios.patch(`/api/portfolios/${portfolio.id}`, {
        isPublished: !portfolio.isPublished,
      });
      toast.success(portfolio.isPublished ? "Portfolio unpublished" : "Portfolio published!");
      router.refresh();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update portfolio";
      toast.error(msg);
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
                myskillspage.com/{username}
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
              myskillspage.com/{username}
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
