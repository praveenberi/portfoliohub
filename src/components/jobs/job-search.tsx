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
} from "@phosphor-icons/react";
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
}: JobSearchProps) {
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
    } catch {
      setSaved((prev) => { const n = new Set(prev); isSaved ? n.add(jobId) : n.delete(jobId); return n; });
      toast.error("Failed to save job");
    }
  };

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
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
          <MagnifyingGlass size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No jobs found</p>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
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
    </div>
  );
}

// ─── Live Jobs Tab ─────────────────────────────────────────────────────────────

function LiveJobsTab() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-green-600 transition-colors">
                  Apply now <ArrowSquareOut size={11} weight="bold" />
                </a>
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

// ─── Main component ────────────────────────────────────────────────────────────

export function JobSearch(props: JobSearchProps) {
  const activeTab = (props.searchParams.tab as string) ?? "live";
  const router = useRouter();
  const pathname = usePathname();

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
        <p className="text-sm text-zinc-500 mt-1">Find your next opportunity.</p>
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
          Posted Jobs
          {props.total > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-200 text-zinc-600 font-semibold">{props.total}</span>}
        </button>
      </div>

      {activeTab === "live" ? (
        <LiveJobsTab />
      ) : (
        <InternalJobsTab {...props} />
      )}
    </div>
  );
}
