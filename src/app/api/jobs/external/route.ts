export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ON_SITE";
  type: string;
  description: string;
  skills: string[];
  postedAt: string;
  applyUrl: string;
  source: string;
  salary?: string;
  companyLogo?: string;
}

function mapEmploymentType(type: string): string {
  const map: Record<string, string> = {
    FULLTIME: "FULL_TIME",
    PARTTIME: "PART_TIME",
    CONTRACTOR: "CONTRACT",
    INTERN: "INTERNSHIP",
  };
  return map[type?.toUpperCase()] ?? "FULL_TIME";
}

function safeDate(value: unknown): string {
  try {
    if (!value) return new Date().toISOString();
    const n = Number(value);
    if (!isNaN(n) && n > 0) return new Date(n * 1000).toISOString();
    const d = new Date(value as string);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date().toISOString();
}

// ── JSearch (RapidAPI) ──────────────────────────────────────────────────────
async function fetchJSearch(q: string, location: string, page: number): Promise<ExternalJob[]> {
  // Build a natural-language query for best results: "developer jobs in Singapore"
  const keyword = q || "jobs";
  const query = location ? `${keyword} in ${location}` : keyword;

  const res = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`,
    {
      headers: {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) throw new Error(`JSearch ${res.status}`);
  const data = await res.json();
  return (data.data ?? []).map((j: any) => ({
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", ") || "Worldwide",
    workMode: j.job_is_remote ? "REMOTE" : "ON_SITE",
    type: mapEmploymentType(j.job_employment_type),
    description: (j.job_description ?? "").slice(0, 400),
    skills: j.job_required_skills ?? [],
    postedAt: j.job_posted_at_datetime_utc ?? new Date().toISOString(),
    applyUrl: j.job_apply_link,
    source: "JSearch",
    companyLogo: j.employer_logo,
    salary:
      j.job_min_salary && j.job_max_salary
        ? `${j.job_salary_currency ?? "USD"} ${Math.round(j.job_min_salary / 1000)}k – ${Math.round(j.job_max_salary / 1000)}k`
        : undefined,
  }));
}

// ── Adzuna ──────────────────────────────────────────────────────────────────
async function fetchAdzuna(q: string, location: string, page: number): Promise<ExternalJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_API_KEY!,
    results_per_page: "12",
    what: q || "developer",
    where: location || "",
    content_type: "application/json",
  });
  const res = await fetch(
    `https://api.adzuna.com/v1/api/jobs/us/search/${page}?${params}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`Adzuna ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).map((j: any) => ({
    id: String(j.id),
    title: j.title,
    company: j.company?.display_name ?? "Unknown",
    location: j.location?.display_name ?? "",
    workMode: "ON_SITE" as const,
    type: "FULL_TIME",
    description: (j.description ?? "").slice(0, 400),
    skills: [],
    postedAt: j.created,
    applyUrl: j.redirect_url,
    source: "Adzuna",
    salary:
      j.salary_min
        ? `$${Math.round(j.salary_min / 1000)}k – $${Math.round((j.salary_max ?? j.salary_min) / 1000)}k`
        : undefined,
  }));
}

// ── The Muse (free, no auth, supports global locations) ─────────────────────
async function fetchTheMuse(q: string, location: string, page: number): Promise<ExternalJob[]> {
  const params = new URLSearchParams();
  if (q) params.set("category", q);
  if (location) params.set("location", location);
  params.set("page", String(page - 1)); // Muse uses 0-indexed pages
  params.set("descending", "true");

  const res = await fetch(`https://www.themuse.com/api/public/jobs?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`TheMuse ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).map((j: any) => ({
    id: String(j.id),
    title: j.name,
    company: j.company?.name ?? "Unknown",
    location: (j.locations ?? []).map((l: any) => l.name).join(", ") || "Worldwide",
    workMode: "ON_SITE" as const,
    type: j.type === "contract" ? "CONTRACT" : "FULL_TIME",
    description: (j.contents ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400),
    skills: (j.tags ?? []).map((t: any) => t.name),
    postedAt: j.publication_date ?? new Date().toISOString(),
    applyUrl: j.refs?.landing_page ?? `https://www.themuse.com/jobs/${j.id}`,
    source: "The Muse",
    companyLogo: j.company?.refs?.logo_image ?? undefined,
  }));
}

// ── RemoteOK (free, no auth, remote only) ───────────────────────────────────
async function fetchRemoteOK(q: string, page: number): Promise<ExternalJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "PortfolioHub/1.0 (Job Browser)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`RemoteOK ${res.status}`);
  const data: any[] = await res.json();

  const jobs = data.filter((j) => {
    if (!j.id || !j.position) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return (
      j.position?.toLowerCase().includes(ql) ||
      j.company?.toLowerCase().includes(ql) ||
      (j.tags ?? []).join(" ").toLowerCase().includes(ql)
    );
  });

  return jobs
    .slice((page - 1) * 12, page * 12)
    .map((j) => ({
      id: String(j.id),
      title: j.position,
      company: j.company,
      location: "Remote",
      workMode: "REMOTE" as const,
      type: "FULL_TIME",
      description: (j.description ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400),
      skills: j.tags ?? [],
      postedAt: safeDate(j.date),
      applyUrl: j.url ?? `https://remoteok.com/remote-jobs/${j.id}`,
      source: "RemoteOK",
      companyLogo: j.company_logo,
    }));
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  // 1. JSearch — location-aware, aggregates LinkedIn/Indeed/Glassdoor
  if (process.env.RAPIDAPI_KEY) {
    try {
      const jobs = await fetchJSearch(q, location, page);
      if (jobs.length > 0) {
        return NextResponse.json({ success: true, data: jobs, source: "JSearch (LinkedIn · Indeed · Glassdoor)" });
      }
    } catch (e) {
      console.error("JSearch failed:", e);
    }
  }

  // 2. Adzuna — location-aware (US-centric)
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY) {
    try {
      const jobs = await fetchAdzuna(q, location, page);
      if (jobs.length > 0) {
        return NextResponse.json({ success: true, data: jobs, source: "Adzuna" });
      }
    } catch (e) {
      console.error("Adzuna failed:", e);
    }
  }

  // 3. The Muse — free, no key, global locations including Singapore
  try {
    const jobs = await fetchTheMuse(q, location, page);
    if (jobs.length > 0) {
      return NextResponse.json({ success: true, data: jobs, source: "The Muse" });
    }
  } catch (e) {
    console.error("TheMuse failed:", e);
  }

  // 4. RemoteOK — only if no specific location requested
  const locLower = location.toLowerCase().trim();
  const wantsRemote = !locLower || locLower.includes("remote") || locLower.includes("worldwide");
  if (wantsRemote) {
    try {
      const jobs = await fetchRemoteOK(q, page);
      if (jobs.length > 0) {
        return NextResponse.json({ success: true, data: jobs, source: "RemoteOK (remote only)" });
      }
    } catch (e) {
      console.error("RemoteOK failed:", e);
    }
  }

  return NextResponse.json(
    { success: false, error: location ? `No jobs found in "${location}". Try a broader location or different keywords.` : "No jobs found. Try different keywords." },
    { status: 404 }
  );
}
