import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse project imageUrl which may be:
 *   - null/empty → []
 *   - JSON array string → string[]
 *   - plain URL string (legacy) → [url]
 */
export function parseProjectImages(imageUrl: string | null | undefined): string[] {
  if (!imageUrl) return [];
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return [imageUrl];
}

/** Parse a JSON-string array field (SQLite stores arrays as JSON strings) */
export function parseArr(v: string | string[] | null | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Parse a JSON-string object (SQLite stores JSON as strings) */
export function parseJson<T = unknown>(v: string | T | null | undefined, fallback: T): T {
  if (!v) return fallback;
  if (typeof v !== "string") return v as T;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(min?: number | null, max?: number | null, currency = "USD"): string {
  if (!min && !max) return "Salary not disclosed";
  if (min && max) return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
  if (min) return `From ${formatCurrency(min, currency)}`;
  return `Up to ${formatCurrency(max!, currency)}`;
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
    [1, "second"],
  ];

  for (const [interval, unit] of intervals) {
    const count = Math.floor(seconds / interval);
    if (count >= 1) {
      return `${count} ${unit}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export function generatePortfolioSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

/**
 * Split a comma-separated skills line while treating parentheses (and brackets)
 * as grouping — commas inside `(...)` or `[...]` stay inside their chunk.
 *
 *   "AWS Infrastructure (EC2, RDS, VPC), CI/CD (Jenkins, GitLab)"
 *     → ["AWS Infrastructure (EC2, RDS, VPC)", "CI/CD (Jenkins, GitLab)"]
 */
export function splitSkillsLine(line: string): string[] {
  const out: string[] = [];
  let buf = "";
  let depth = 0;
  for (const ch of line) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      const t = buf.trim();
      if (t) out.push(t);
      buf = "";
    } else {
      buf += ch;
    }
  }
  const t = buf.trim();
  if (t) out.push(t);
  return out;
}

/**
 * Group a flat skills list into labelled buckets.
 *
 * Recognises two input shapes:
 *   1. Items that embed their own group as a prefix, e.g. "AWS Services: EC2"
 *      → starts an "AWS Services" group and adds "EC2" to it. Subsequent items
 *      without a "Group:" prefix continue under the same group until the next
 *      "Group:" marker.
 *   2. Multi-line strings using markdown headings ("## Group" / "### Sub")
 *      followed by comma-separated skills — same format the portfolio's
 *      customSkills field accepts.
 *
 * Items at the top with no group are placed in an unlabelled bucket so the
 * caller can render them without a header.
 */
export function groupSkills(skills: string[]): Array<{ label: string | null; items: string[] }> {
  const groups: Array<{ label: string | null; items: string[] }> = [];
  let current: { label: string | null; items: string[] } = { label: null, items: [] };
  const push = () => {
    if (current.items.length || current.label) groups.push(current);
  };

  for (const raw of skills) {
    const text = (raw ?? "").trim();
    if (!text) continue;

    // Multi-line skill strings (## Group / ### Sub / "a, b, c")
    if (text.includes("\n") || /^#{2,3}\s/.test(text)) {
      for (const lineRaw of text.split(/\r?\n/)) {
        const line = lineRaw.trim();
        if (!line) continue;
        const h2 = line.match(/^##\s+(.+)$/);
        const h3 = line.match(/^###\s+(.+)$/);
        if (h2 || h3) {
          push();
          current = { label: (h2 ? h2[1] : h3![1]).trim(), items: [] };
          continue;
        }
        for (const part of splitSkillsLine(line)) {
          if (part) current.items.push(part);
        }
      }
      continue;
    }

    // "Group Name: skill" prefix → start a new group
    const m = text.match(/^([A-Z][A-Za-z0-9&+/\-\s]{1,40}):\s*(.+)$/);
    if (m) {
      push();
      current = { label: m[1].trim(), items: [m[2].trim()] };
      continue;
    }

    current.items.push(text);
  }
  push();
  return groups;
}

/**
 * Render a flat skills array as the multi-line grouped text format
 * (`## Group` / `skill1, skill2, ...`). Used to seed a textarea so users can
 * edit and re-arrange groups visually.
 */
export function skillsToGroupedText(skills: string[]): string {
  const groups = groupSkills(skills);
  return groups
    .map((g) => {
      const header = g.label ? `## ${g.label}\n` : "";
      return header + g.items.join(", ");
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Parse the grouped-text format back into a flat skills array using the
 * "Group: firstItem" / "remainingItem" convention so the round-trip through
 * groupSkills produces the same groups.
 */
export function groupedTextToSkills(text: string): string[] {
  if (!text || !text.trim()) return [];
  const groups = groupSkills([text]);
  const out: string[] = [];
  for (const g of groups) {
    if (g.items.length === 0) continue;
    if (g.label) {
      out.push(`${g.label}: ${g.items[0]}`);
      for (let i = 1; i < g.items.length; i++) out.push(g.items[i]);
    } else {
      out.push(...g.items);
    }
  }
  return out;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
  TECHNICAL_TEST: "bg-orange-50 text-orange-700 border-orange-200",
  OFFER_RECEIVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  WITHDRAWN: "bg-zinc-50 text-zinc-600 border-zinc-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  INTERVIEW_SCHEDULED: "Interview",
  TECHNICAL_TEST: "Technical Test",
  OFFER_RECEIVED: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ACCEPTED: "Accepted",
};
