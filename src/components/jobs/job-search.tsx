"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { parseArr } from "@/lib/utils";
import {
  MagnifyingGlass,
  MapPin,
  BookmarkSimple,
  Bookmark,
  ArrowRight,
  SlidersHorizontal,
  ArrowSquareOut,
  Globe,
  CheckCircle,
} from "@phosphor-icons/react";
import { externalJobId } from "@/lib/external-job";
import type { Job } from "@prisma/client";
import { formatSalaryRange, timeAgo } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import type { ExternalJob } from "@/app/api/jobs/external/route";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { LOCATION_SUGGESTIONS, JOB_TITLE_SUGGESTIONS } from "@/lib/suggestions";

interface JobSearchProps {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  savedJobIds: string[];
  searchParams: Record<string, string | undefined>;
  /** User's profile.location, used to seed the live-jobs location field. */
  defaultLocation?: string;
  /** Number of skills + technologies on the user's profile (powers the Matching Jobs empty state). */
  userSkillCount?: number;
  /** Auto-generated keyword string used by the Matching tab to fetch external matches. */
  matchingQuery?: string;
  /** Top profile skills, used to fan out external lookups beyond a single query. */
  userTopSkills?: string[];
  /** Full list of profile skills + technologies — the source of truth for the
   * client-side >= N matching filter applied to live external listings. */
  userSkills?: string[];
  /** How many distinct user skills a job must mention to count as a match. */
  minMatchSkills?: number;
}

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

const WORK_MODE_COLORS: Record<string, string> = {
  REMOTE: "bg-green-50 text-green-700",
  HYBRID: "bg-yellow-50 text-yellow-700",
  ON_SITE: "bg-blue-50 text-blue-700",
};

// ─── Shared search bar ─────────────────────────────────────────────────────────

function SearchBar({
  q,
  location,
  onQ,
  onLocation,
  showFilters,
  onToggleFilters,
  filterSlot,
}: {
  q: string;
  location: string;
  onQ: (v: string) => void;
  onLocation: (v: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterSlot?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <AutocompleteInput
            value={q}
            onChange={onQ}
            suggestions={JOB_TITLE_SUGGESTIONS}
            placeholder="Role, company, or keyword..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            leftIcon={<MagnifyingGlass size={16} />}
          />
        </div>
        <div className="w-52">
          <AutocompleteInput
            value={location}
            onChange={onLocation}
            suggestions={LOCATION_SUGGESTIONS}
            placeholder="Location"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            leftIcon={<MapPin size={16} />}
          />
        </div>
        {filterSlot && (
          <button
            onClick={onToggleFilters}
            className={`h-10 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
              showFilters ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        )}
      </div>
      {showFilters && filterSlot}
    </div>
  );
}

// ─── Internal Jobs Tab ─────────────────────────────────────────────────────────

function InternalJobsTab({
  jobs, total, page, limit, savedJobIds, searchParams,
  onSavedChange,
  onLiveMatchCount,
  userSkillCount = 0,
  matchingQuery = "",
  defaultLocation = "",
  userTopSkills = [],
  userSkills = [],
  minMatchSkills = 3,
}: JobSearchProps & {
  onSavedChange?: () => void;
  /** Bubble the live external match count up to the parent so the tab badge
   * reflects internal + external instead of just internal. */
  onLiveMatchCount?: (n: number) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<Set<string>>(new Set(savedJobIds));
  const [showFilters, setShowFilters] = useState(false);

  const updateSearch = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}&tab=posted`));
  };

  const handleSaveToggle = async (jobId: string) => {
    const isSaved = saved.has(jobId);
    setSaved((prev) => { const n = new Set(prev); isSaved ? n.delete(jobId) : n.add(jobId); return n; });
    try {
      if (isSaved) await axios.delete(`/api/jobs/${jobId}/save`);
      else await axios.post(`/api/jobs/${jobId}/save`);
      onSavedChange?.();
    } catch {
      setSaved((prev) => { const n = new Set(prev); isSaved ? n.add(jobId) : n.delete(jobId); return n; });
      toast.error("Failed to save job");
    }
  };

  // ── External (live) jobs that match the user's profile keywords ──
  // Posted-job inventory in the local DB is small, so without this the
  // Matching tab feels empty even when the user has 20+ skills. Fan out to
  // multiple external queries (headline + each top skill) so the user gets
  // the full breadth of relevant listings instead of a single source's first
  // page.
  const [extJobs, setExtJobs] = useState<ExternalJob[]>([]);
  const [extLoading, setExtLoading] = useState(false);
  const [extSources, setExtSources] = useState<string[]>([]);
  const [extQueriesUsed, setExtQueriesUsed] = useState(0);

  // Stable list of queries: typed q (priority) + headline + each top skill,
  // deduped, capped. Wider cap than before so users with broad profiles get
  // wider coverage in a single load.
  const typedQuery = (searchParams.q ?? "").trim();
  const queries = (() => {
    const out: string[] = [];
    const seen = new Set<string>();
    const add = (q: string) => {
      const k = q.trim().toLowerCase();
      if (!k) return;
      if (seen.has(k)) return;
      seen.add(k);
      out.push(q.trim());
    };
    if (typedQuery) add(typedQuery);
    if (matchingQuery) add(matchingQuery);
    for (const s of userTopSkills) add(s);
    return out.slice(0, 12);
  })();
  // Reduce to a stable string so the effect re-runs only when the actual list changes.
  const queriesKey = queries.join("|");

  useEffect(() => {
    let cancelled = false;
    if (queries.length === 0) {
      setExtJobs([]);
      setExtSources([]);
      setExtQueriesUsed(0);
      onLiveMatchCount?.(0);
      return;
    }
    setExtLoading(true);
    (async () => {
      try {
        const results = await Promise.all(
          queries.map(async (q) => {
            const params = new URLSearchParams({ q });
            if (defaultLocation) params.set("location", defaultLocation);
            try {
              const r = await fetch(`/api/jobs/external?${params}`, { cache: "no-store" });
              if (!r.ok) return { jobs: [] as ExternalJob[], source: "" };
              const data = await r.json();
              return { jobs: (data?.data ?? []) as ExternalJob[], source: (data?.source as string) ?? "" };
            } catch {
              return { jobs: [] as ExternalJob[], source: "" };
            }
          })
        );
        if (cancelled) return;
        const seen = new Set<string>();
        const merged: ExternalJob[] = [];
        const sources = new Set<string>();
        for (const r of results) {
          if (r.source) sources.add(r.source);
          for (const j of r.jobs) {
            const key = `${j.source}::${j.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            merged.push(j);
          }
        }
        // Apply the same N-skill threshold the server uses for internal matches.
        const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const lowerSkills = userSkills.map((s) => s.toLowerCase().trim()).filter(Boolean);
        const countMatches = (j: ExternalJob): number => {
          if (lowerSkills.length === 0) return 0;
          const haystack = (
            (j.skills ?? []).join(" ") + " " + (j.title ?? "") + " " + (j.description ?? "")
          ).toLowerCase();
          let n = 0;
          for (const s of lowerSkills) {
            if (new RegExp(`\\b${escapeRe(s)}\\b`, "i").test(haystack)) n++;
          }
          return n;
        };
        // When the user explicitly typed a search, honour it: drop the
        // skill threshold to 1 so the typed query isn't filtered out by an
        // unrelated profile (e.g. "Full Stack Developer" search against a
        // Business-Analyst-heavy profile).
        const baseThreshold = Math.min(minMatchSkills, Math.max(1, lowerSkills.length));
        const threshold = typedQuery ? Math.min(1, baseThreshold) : baseThreshold;
        const scored = merged
          .map((j) => ({ job: j, matches: countMatches(j) }))
          .filter((s) => s.matches >= threshold)
          .sort((a, b) => b.matches - a.matches);
        setExtJobs(scored.map((s) => s.job));
        setExtSources(Array.from(sources));
        setExtQueriesUsed(queries.length);
        onLiveMatchCount?.(scored.length);
      } finally {
        if (!cancelled) setExtLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriesKey, defaultLocation]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <SearchBar
        q={searchParams.q ?? ""}
        location={searchParams.location ?? ""}
        onQ={(v) => updateSearch("q", v)}
        onLocation={(v) => updateSearch("location", v)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filterSlot={
          <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-100">
            <select defaultValue={searchParams.workMode ?? ""} onChange={(e) => updateSearch("workMode", e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 focus:outline-none focus:border-green-500">
              <option value="">Work mode</option>
              {Object.entries(WORK_MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select defaultValue={searchParams.type ?? ""} onChange={(e) => updateSearch("type", e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 focus:outline-none focus:border-green-500">
              <option value="">Job type</option>
              {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select defaultValue={searchParams.minSalary ?? ""} onChange={(e) => updateSearch("minSalary", e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 focus:outline-none focus:border-green-500">
              <option value="">Min salary</option>
              {[50000, 80000, 100000, 120000, 150000, 180000, 200000].map((s) => (
                <option key={s} value={s}>${(s / 1000).toFixed(0)}k+</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Top banner — always visible while the user has skills, so the rule is
          obvious whether internal matches are zero or many. */}
      {userSkillCount === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-900 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="flex-1">
            Add skills to your profile so we can match you with relevant jobs from posted listings and Live sources.
          </span>
          <Link
            href="/dashboard/profile"
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800"
          >
            Edit profile <ArrowRight size={11} weight="bold" />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-accent-200 bg-accent-50/60 px-4 py-3 text-xs text-accent-900 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
          Showing jobs that mention at least{" "}
          <span className="font-semibold">{minMatchSkills} of your {userSkillCount} profile skill{userSkillCount === 1 ? "" : "s"}</span>.
        </div>
      )}

      {isPending ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="space-y-1.5"><div className="h-3 w-32 skeleton rounded-full" /><div className="h-2.5 w-20 skeleton rounded-full" /></div>
              </div>
              <div className="h-3 w-full skeleton rounded-full" />
              <div className="h-3 w-3/4 skeleton rounded-full" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        // Internal posted-jobs inventory is empty for this profile — quietly
        // skip the big empty-state card so the Live matches section below
        // takes over as the primary content.
        null
      ) : (
        <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-card transition-all duration-200 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                    {job.company[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-950 leading-tight">{job.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{job.company}</div>
                  </div>
                </div>
                <button onClick={() => handleSaveToggle(job.id)} className="p-1.5 rounded-lg hover:bg-zinc-50 transition-colors flex-shrink-0">
                  {saved.has(job.id) ? <Bookmark size={15} weight="fill" className="text-green-500" /> : <BookmarkSimple size={15} className="text-zinc-400" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${WORK_MODE_COLORS[job.workMode]}`}>{WORK_MODE_LABELS[job.workMode]}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-100">{JOB_TYPE_LABELS[job.type]}</span>
                {job.isFeatured && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">Featured</span>}
              </div>
              {job.location && <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2"><MapPin size={12} />{job.location}</div>}
              {(job.minSalary || job.maxSalary) && <div className="text-xs font-medium text-zinc-700 mb-3">{formatSalaryRange(job.minSalary, job.maxSalary, job.currency)}</div>}
              {parseArr(job.skills).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {parseArr(job.skills).slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-zinc-50 text-zinc-500 text-[11px] rounded-full border border-zinc-100">{skill}</span>
                  ))}
                  {parseArr(job.skills).length > 4 && (
                    <span className="px-2 py-0.5 bg-zinc-50 text-zinc-400 text-[11px] rounded-full border border-zinc-100">+{parseArr(job.skills).length - 4}</span>
                  )}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-400">{timeAgo(job.postedAt)}</span>
                <Link href={`/dashboard/jobs/${job.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-green-600 transition-colors">
                  View & apply <ArrowRight size={11} weight="bold" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            const p = i + 1;
            return (
              <Link key={p} href={`${pathname}?${new URLSearchParams({ ...searchParams, page: String(p), tab: "posted" })}`}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${p === page ? "bg-zinc-950 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
                {p}
              </Link>
            );
          })}
        </div>
      )}

      {/* Live external matches — fanned out across headline + each top skill */}
      {queries.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className={`flex items-center justify-between gap-3 ${jobs.length > 0 ? "border-t border-zinc-100 pt-5" : ""}`}>
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
                <Globe size={14} className="text-accent-500" />
                {jobs.length > 0 ? "Live matches" : "Matched live jobs"}
                {!extLoading && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-accent-50 text-accent-700 font-semibold">{extJobs.length}</span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Searched{" "}
                {extSources.length > 0 ? <>via <span className="font-medium text-zinc-600">{extSources.join(" · ")}</span></> : "live job sources"}
                {typedQuery ? (
                  <> for <span className="font-medium text-zinc-600">"{typedQuery}"</span></>
                ) : extQueriesUsed > 0 ? (
                  <> across <span className="font-medium text-zinc-600">{extQueriesUsed} keyword{extQueriesUsed === 1 ? "" : "s"}</span> from your profile</>
                ) : null}
                {defaultLocation ? <> in <span className="font-medium text-zinc-600">{defaultLocation}</span></> : null}.
              </p>
            </div>
            <Link
              href={`/dashboard/jobs?tab=live`}
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-1 shrink-0"
            >
              See all live <ArrowRight size={11} />
            </Link>
          </div>

          {extLoading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl skeleton" />
                    <div className="space-y-1.5"><div className="h-3 w-32 skeleton rounded-full" /><div className="h-2.5 w-20 skeleton rounded-full" /></div>
                  </div>
                  <div className="h-3 w-full skeleton rounded-full" />
                  <div className="h-3 w-3/4 skeleton rounded-full" />
                </div>
              ))}
            </div>
          ) : extJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-xs text-zinc-500">
              No live matches right now — try the <Link href="?tab=live" className="text-accent-700 font-medium underline">Live Jobs</Link> tab to broaden the search.
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {extJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-card transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {job.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl object-contain border border-zinc-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                        {job.company[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-950 leading-tight truncate">{job.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate">{job.company}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 flex-shrink-0">{job.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${WORK_MODE_COLORS[job.workMode] ?? "bg-zinc-50 text-zinc-600"}`}>
                      {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-100">
                      {JOB_TYPE_LABELS[job.type] ?? job.type}
                    </span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2"><MapPin size={12} />{job.location}</div>
                  )}
                  {job.salary && <div className="text-xs font-medium text-zinc-700 mb-2">{job.salary}</div>}
                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-zinc-50 text-zinc-500 text-[11px] rounded-full border border-zinc-100">{skill}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="px-2 py-0.5 bg-zinc-50 text-zinc-400 text-[11px] rounded-full border border-zinc-100">+{job.skills.length - 4}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100">
                    <span className="text-[11px] text-zinc-400">{job.postedAt ? timeAgo(job.postedAt) : ""}</span>
                    {job.applyUrl && (
                      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-green-600 transition-colors">
                        Apply now <ArrowSquareOut size={11} weight="bold" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Live Jobs Tab ─────────────────────────────────────────────────────────────

const SG_QUICK_FILTERS = [
  { label: "All Singapore", location: "Singapore" },
  { label: "Central", location: "Central, Singapore" },
  { label: "East", location: "East Singapore" },
  { label: "West / Jurong", location: "Jurong, Singapore" },
  { label: "Remote", location: "Remote" },
];

function LiveJobsTab({
  onSavedChange,
  onAppliedChange,
  defaultLocation,
}: {
  onSavedChange?: () => void;
  onAppliedChange?: () => void;
  defaultLocation?: string;
} = {}) {
  const [q, setQ] = useState("");
  // Seed from the user's profile.location when available; fall back to "" so we
  // search worldwide instead of forcing a region. The user can still type
  // anything in the search bar to override.
  const [location, setLocation] = useState((defaultLocation ?? "").trim() || "");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [applyingKey, setApplyingKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the bookmark + applied state once on mount from the saved + applications APIs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          fetch("/api/jobs/saved", { cache: "no-store" }),
          fetch("/api/applications", { cache: "no-store" }),
        ]);
        if (!cancelled && savedRes.ok) {
          const data = await savedRes.json();
          const ids = (data?.data ?? [])
            .map((j: { id: string }) => j.id)
            .filter((id: string) => id.startsWith("ext-"));
          setSavedKeys(new Set(ids));
        }
        if (!cancelled && appliedRes.ok) {
          const data = await appliedRes.json();
          const ids = (data?.data ?? [])
            .map((a: { jobId: string }) => a.jobId)
            .filter((id: string) => id.startsWith("ext-"));
          setAppliedKeys(new Set(ids));
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function toggleSave(job: ExternalJob) {
    const key = externalJobId(job.source, job.id);
    const wasSaved = savedKeys.has(key);
    setSavingKey(key);
    setSavedKeys((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      if (wasSaved) {
        await axios.delete(`/api/jobs/save-external?source=${encodeURIComponent(job.source)}&externalId=${encodeURIComponent(job.id)}`);
      } else {
        await axios.post("/api/jobs/save-external", job);
        toast.success("Saved");
      }
      onSavedChange?.();
    } catch (err) {
      // revert on failure
      setSavedKeys((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(key) : next.delete(key);
        return next;
      });
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Couldn't save";
      toast.error(msg);
    } finally {
      setSavingKey(null);
    }
  }

  async function markApplied(job: ExternalJob) {
    const key = externalJobId(job.source, job.id);
    if (appliedKeys.has(key)) return;
    setApplyingKey(key);
    // Optimistic — flip the badge instantly
    setAppliedKeys((prev) => { const next = new Set(prev); next.add(key); return next; });
    try {
      const { data } = await axios.post("/api/applications/external", job);
      if (data?.alreadyApplied) {
        toast("Already applied to this job");
      } else {
        toast.success("Marked as applied");
      }
      onAppliedChange?.();
    } catch (err) {
      // Roll back on failure
      setAppliedKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Couldn't mark as applied";
      toast.error(msg);
    } finally {
      setApplyingKey(null);
    }
  }

  async function unmarkApplied(job: ExternalJob) {
    const key = externalJobId(job.source, job.id);
    if (!appliedKeys.has(key)) return;
    setApplyingKey(key);
    setAppliedKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
    try {
      await axios.delete(`/api/applications/external?source=${encodeURIComponent(job.source)}&externalId=${encodeURIComponent(job.id)}`);
      onAppliedChange?.();
    } catch (err) {
      // Roll back on failure
      setAppliedKeys((prev) => { const next = new Set(prev); next.add(key); return next; });
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Couldn't unmark";
      toast.error(msg);
    } finally {
      setApplyingKey(null);
    }
  }

  const fetchJobs = useCallback(async (query: string, loc: string, pg: number) => {
    setLoading(true);
    setError("");
    setNotFound(false);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (loc) params.set("location", loc);
      params.set("page", String(pg));
      const res = await fetch(`/api/jobs/external?${params}`);
      const data = await res.json();
      if (res.status === 404) { setNotFound(true); setJobs([]); setSearched(true); return; }
      if (!res.ok || !data.success) throw new Error(data.error ?? "Failed");
      setJobs(data.data ?? []);
      setSource(data.source ?? "");
      setSearched(true);
    } catch (e: any) {
      setError(e.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced auto-search on q or location change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchJobs(q, location, 1);
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, location, fetchJobs]);

  return (
    <div className="space-y-6">
      <SearchBar
        q={q}
        location={location}
        onQ={setQ}
        onLocation={setLocation}
        showFilters={false}
        onToggleFilters={() => {}}
      />

      {/* Quick region chips */}
      <div className="flex flex-wrap gap-2">
        {SG_QUICK_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => { setLocation(f.location); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              location === f.location
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {source && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Globe size={12} />
          Sourced from <span className="font-medium text-zinc-600">{source}</span>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="space-y-1.5"><div className="h-3 w-32 skeleton rounded-full" /><div className="h-2.5 w-20 skeleton rounded-full" /></div>
              </div>
              <div className="h-3 w-full skeleton rounded-full" />
              <div className="h-3 w-3/4 skeleton rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button onClick={() => fetchJobs(q, location, page)} className="mt-3 text-xs text-red-600 underline">Retry</button>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
          <MapPin size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No jobs found {location ? `in "${location}"` : ""}</p>
          <p className="text-xs text-zinc-400 mt-1">Try a broader location or different keywords</p>
        </div>
      ) : jobs.length === 0 && searched ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
          <MagnifyingGlass size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No jobs found</p>
          <p className="text-xs text-zinc-400 mt-1">Try different keywords or location</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-card transition-all duration-200 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl object-contain border border-zinc-100 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                    {job.company[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-950 leading-tight truncate">{job.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">{job.company}</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 flex-shrink-0">{job.source}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${WORK_MODE_COLORS[job.workMode] ?? "bg-zinc-50 text-zinc-600"}`}>
                  {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-100">
                  {JOB_TYPE_LABELS[job.type] ?? job.type}
                </span>
              </div>

              {job.location && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
                  <MapPin size={12} />{job.location}
                </div>
              )}

              {job.salary && (
                <div className="text-xs font-medium text-zinc-700 mb-2">{job.salary}</div>
              )}

              {job.description && (
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">{job.description}</p>
              )}

              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-zinc-50 text-zinc-500 text-[11px] rounded-full border border-zinc-100">{skill}</span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-zinc-50 text-zinc-400 text-[11px] rounded-full border border-zinc-100">+{job.skills.length - 4}</span>
                  )}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-400">{job.postedAt ? timeAgo(job.postedAt) : ""}</span>
                <div className="flex items-center gap-3">
                  {(() => {
                    const key = externalJobId(job.source, job.id);
                    const isSaved = savedKeys.has(key);
                    const isApplied = appliedKeys.has(key);
                    const saveBusy = savingKey === key;
                    const applyBusy = applyingKey === key;
                    return (
                      <>
                        <button
                          onClick={() => toggleSave(job)}
                          disabled={saveBusy}
                          title={isSaved ? "Saved — click to unsave" : "Save this job"}
                          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                            isSaved ? "text-green-600 hover:text-green-700" : "text-zinc-500 hover:text-zinc-950"
                          } disabled:opacity-50`}
                        >
                          {isSaved ? <BookmarkSimple size={13} weight="fill" /> : <Bookmark size={13} />}
                          {isSaved ? "Saved" : "Save"}
                        </button>
                        <button
                          onClick={() => (isApplied ? unmarkApplied(job) : markApplied(job))}
                          disabled={applyBusy}
                          title={isApplied ? "Marked as applied — click to undo" : "Mark this job as applied"}
                          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                            isApplied ? "text-green-600 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-950"
                          } disabled:opacity-50`}
                        >
                          {isApplied ? <CheckCircle size={13} weight="fill" /> : <CheckCircle size={13} />}
                          {isApplied ? "Applied" : "Mark applied"}
                        </button>
                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              // Best-effort: also flag as applied when opening the external page,
                              // matching the user's intent that "Apply now" implies they applied.
                              if (!isApplied) markApplied(job);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-green-600 transition-colors"
                          >
                            Apply now <ArrowSquareOut size={11} weight="bold" />
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {jobs.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchJobs(q, location, p); }}
            disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-zinc-200 text-zinc-600 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
          <span className="text-sm text-zinc-500 px-2">Page {page}</span>
          <button onClick={() => { const p = page + 1; setPage(p); fetchJobs(q, location, p); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-zinc-200 text-zinc-600 hover:border-zinc-300">›</button>
        </div>
      )}
    </div>
  );
}

// ─── Saved Jobs Tab ────────────────────────────────────────────────────────────

type SavedJobItem = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ON_SITE";
  type: string;
  description: string;
  skills: string[];
  applyUrl: string;
  externalUrl: string | null;
  source: string;
  savedAt: string;
  salary: string | null;
  postedAt: string;
};

function SavedJobsTab({ refreshKey, onChange }: { refreshKey: number; onChange?: () => void }) {
  const [items, setItems] = useState<SavedJobItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/jobs/saved", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Failed");
      setItems(data?.data ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function unsave(item: SavedJobItem) {
    const isExternal = item.id.startsWith("ext-");
    const prevItems = items ?? [];
    setItems((curr) => (curr ? curr.filter((j) => j.id !== item.id) : curr));
    try {
      if (isExternal) {
        // id format: ext-<source-slug>-<externalId>; recover the trailing externalId
        const trimmed = item.id.replace(/^ext-[^-]+-/, "");
        await axios.delete(`/api/jobs/save-external?source=${encodeURIComponent(item.source)}&externalId=${encodeURIComponent(trimmed)}`);
      } else {
        await axios.delete(`/api/jobs/${item.id}/save`);
      }
      onChange?.();
    } catch {
      // revert
      setItems(prevItems);
      toast.error("Couldn't unsave");
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }
  if (items === null) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
            <div className="h-3 w-32 skeleton rounded-full" />
            <div className="h-3 w-3/4 skeleton rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
        <BookmarkSimple size={32} className="text-zinc-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-500">No saved jobs yet</p>
        <p className="text-xs text-zinc-400 mt-1">Hit the bookmark icon on any Live Job to save it here.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((job, i) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-card transition-all duration-200 flex flex-col"
        >
          <div className="flex items-start gap-3 mb-3">
            {job.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-xl object-contain border border-zinc-100 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                {job.company[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-950 leading-tight truncate">{job.title}</div>
              <div className="text-xs text-zinc-400 mt-0.5 truncate">{job.company}</div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 flex-shrink-0">{job.source}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${WORK_MODE_COLORS[job.workMode] ?? "bg-zinc-50 text-zinc-600"}`}>
              {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-100">
              {JOB_TYPE_LABELS[job.type] ?? job.type}
            </span>
          </div>

          {job.location && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
              <MapPin size={12} />{job.location}
            </div>
          )}

          {job.salary && <div className="text-xs font-medium text-zinc-700 mb-2">{job.salary}</div>}

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {job.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-zinc-50 text-zinc-500 text-[11px] rounded-full border border-zinc-100">{skill}</span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-0.5 bg-zinc-50 text-zinc-400 text-[11px] rounded-full border border-zinc-100">+{job.skills.length - 4}</span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100">
            <span className="text-[11px] text-zinc-400">Saved {timeAgo(job.savedAt)}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => unsave(job)}
                title="Unsave"
                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-red-600 transition-colors"
              >
                <BookmarkSimple size={13} weight="fill" /> Saved
              </button>
              {job.applyUrl && (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-green-600 transition-colors"
                >
                  Apply now <ArrowSquareOut size={11} weight="bold" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function JobSearch(props: JobSearchProps) {
  const activeTab = (props.searchParams.tab as string) ?? "live";
  const router = useRouter();
  const pathname = usePathname();
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  // Live external matches counted by the InternalJobsTab so the tab badge can
  // reflect internal + live, not just the internal posted count.
  const [liveMatchCount, setLiveMatchCount] = useState<number | null>(null);

  // Pull the initial saved count on mount and whenever the user toggles a save
  // anywhere — keeps the tab badge accurate without a full router refresh.
  const refreshSavedCount = useCallback(async () => {
    try {
      const r = await fetch("/api/jobs/saved", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      setSavedCount(Array.isArray(data?.data) ? data.data.length : 0);
    } catch {}
  }, []);
  useEffect(() => { refreshSavedCount(); }, [refreshSavedCount]);

  function bumpSaved() {
    setSavedRefreshKey((k) => k + 1);
    refreshSavedCount();
  }

  function switchTab(tab: string) {
    const params = new URLSearchParams(props.searchParams as Record<string, string>);
    params.set("tab", tab);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Browse Jobs</h1>
        <p className="text-sm text-zinc-500 mt-1">Live jobs from Singapore and worldwide — sourced from JobStreet, LinkedIn, Indeed, MyCareersFuture and more.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        <button onClick={() => switchTab("live")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "live" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
          Live Jobs
          <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] bg-green-100 text-green-700 font-semibold">NEW</span>
        </button>
        <button onClick={() => switchTab("posted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "posted" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
          Matching Jobs
          {(props.userSkillCount ?? 0) > 0 && (() => {
            const combined = props.total + (liveMatchCount ?? 0);
            return (
              <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-200 text-zinc-600 font-semibold">
                {liveMatchCount === null ? props.total : combined}
              </span>
            );
          })()}
        </button>
        <button onClick={() => switchTab("saved")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "saved" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
          Saved Jobs
          {(savedCount ?? 0) > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] bg-orange-100 text-orange-700 font-semibold">{savedCount}</span>
          )}
        </button>
      </div>

      {activeTab === "live" ? (
        <LiveJobsTab
          onSavedChange={bumpSaved}
          onAppliedChange={bumpSaved}
          defaultLocation={props.defaultLocation}
        />
      ) : activeTab === "saved" ? (
        <SavedJobsTab refreshKey={savedRefreshKey} onChange={bumpSaved} />
      ) : (
        <InternalJobsTab
          {...props}
          onSavedChange={bumpSaved}
          onLiveMatchCount={setLiveMatchCount}
        />
      )}
    </div>
  );
}
