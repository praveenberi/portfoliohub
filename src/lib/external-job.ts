/**
 * Deterministic Job.id we use when persisting an external listing
 * (MyCareersFuture / JSearch / Adzuna / The Muse / RemoteOK / …).
 *
 * Same source + externalId always maps to the same Job row, so saving and
 * applying are both idempotent and the DELETE handlers can rebuild the id
 * from query params.
 */
export function externalJobId(source: string, externalId: string) {
  const slug = (source ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "ext";
  const safeId = (externalId ?? "").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80);
  return `ext-${slug}-${safeId}`;
}

export function workModeToEnum(value: string | undefined) {
  const v = (value ?? "").toUpperCase();
  return v === "REMOTE" || v === "HYBRID" ? v : "ON_SITE";
}

export function jobTypeToEnum(value: string | undefined) {
  const v = (value ?? "").toUpperCase();
  if (["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"].includes(v)) return v;
  return "FULL_TIME";
}

export function parseSalaryRange(s?: string | null): {
  minSalary: number | null;
  maxSalary: number | null;
  currency: string;
} {
  if (!s) return { minSalary: null, maxSalary: null, currency: "USD" };
  const currencyMatch = s.match(/\b(USD|SGD|EUR|GBP|AUD|CAD|INR)\b/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : "USD";
  const nums = s.match(/(\d+(?:\.\d+)?)\s*k?/gi) ?? [];
  const toCents = (m: string) => {
    const n = Number(m.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(n)) return null;
    return /k/i.test(m) ? Math.round(n * 1000) : Math.round(n);
  };
  const values = nums.map(toCents).filter((n): n is number => n !== null);
  if (values.length === 0) return { minSalary: null, maxSalary: null, currency };
  const minSalary = values[0] ?? null;
  const maxSalary = values[1] ?? values[0] ?? null;
  return { minSalary, maxSalary, currency };
}

/**
 * Build the Job.upsert payload for an incoming external listing.
 * Used by both save-external and applications/external.
 */
export function buildJobUpsert(input: {
  id?: string;
  source?: string;
  title?: string;
  company?: string;
  companyLogo?: string;
  location?: string;
  workMode?: string;
  type?: string;
  description?: string;
  skills?: string[];
  postedAt?: string;
  applyUrl?: string;
  salary?: string;
}) {
  const externalId = String(input.id ?? "").trim();
  const source = String(input.source ?? "").trim();
  const title = String(input.title ?? "").trim();
  const company = String(input.company ?? "").trim();
  if (!externalId || !source || !title || !company) return null;

  const id = externalJobId(source, externalId);
  const { minSalary, maxSalary, currency } = parseSalaryRange(input.salary);
  const skills = Array.isArray(input.skills)
    ? input.skills.filter((s) => typeof s === "string").slice(0, 40)
    : [];
  const postedAt = input.postedAt ? new Date(input.postedAt) : new Date();
  const applyUrl = input.applyUrl ?? null;

  return {
    id,
    data: {
      title: title.slice(0, 200),
      company: company.slice(0, 200),
      companyLogo: input.companyLogo ?? null,
      location: input.location?.slice(0, 200) ?? null,
      workMode: workModeToEnum(input.workMode),
      type: jobTypeToEnum(input.type),
      description: (input.description ?? "").slice(0, 2000) || `External listing from ${source}`,
      skills: JSON.stringify(skills),
      minSalary,
      maxSalary,
      currency,
      isApproved: true,
      isActive: true,
      externalUrl: applyUrl,
      applyUrl,
      postedAt: Number.isNaN(postedAt.getTime()) ? new Date() : postedAt,
    },
  };
}
