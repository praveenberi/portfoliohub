export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Deterministic Job id for an external listing. Lets POST be idempotent
// across re-saves and powers `?source=…&externalId=…` lookups for DELETE.
function externalJobId(source: string, externalId: string) {
  const slug = source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "ext";
  const safeId = externalId.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80);
  return `ext-${slug}-${safeId}`;
}

function workModeToEnum(value: string | undefined) {
  const v = (value ?? "").toUpperCase();
  return v === "REMOTE" || v === "HYBRID" ? v : "ON_SITE";
}
function jobTypeToEnum(value: string | undefined) {
  const v = (value ?? "").toUpperCase();
  if (["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"].includes(v)) return v;
  return "FULL_TIME";
}
function parseSalary(s?: string | null): { minSalary: number | null; maxSalary: number | null; currency: string } {
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
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
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const externalId = String(body.id ?? "").trim();
  const source = String(body.source ?? "").trim();
  const title = String(body.title ?? "").trim();
  const company = String(body.company ?? "").trim();
  if (!externalId || !source || !title || !company) {
    return NextResponse.json({ error: "Missing id, source, title, or company" }, { status: 400 });
  }

  const id = externalJobId(source, externalId);
  const { minSalary, maxSalary, currency } = parseSalary(body.salary);
  const skills = Array.isArray(body.skills) ? body.skills.filter((s) => typeof s === "string").slice(0, 40) : [];
  const postedAt = body.postedAt ? new Date(body.postedAt) : new Date();
  const applyUrl = body.applyUrl ?? null;

  const data = {
    title: title.slice(0, 200),
    company: company.slice(0, 200),
    companyLogo: body.companyLogo ?? null,
    location: body.location?.slice(0, 200) ?? null,
    workMode: workModeToEnum(body.workMode),
    type: jobTypeToEnum(body.type),
    description: (body.description ?? "").slice(0, 2000) || `External listing from ${source}`,
    skills: JSON.stringify(skills),
    minSalary,
    maxSalary,
    currency,
    isApproved: true,
    isActive: true,
    externalUrl: applyUrl,
    applyUrl,
    postedAt: Number.isNaN(postedAt.getTime()) ? new Date() : postedAt,
  };

  await prisma.job.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });

  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: session.user.id, jobId: id } },
    create: { userId: session.user.id, jobId: id },
    update: {},
  });

  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const source = (searchParams.get("source") ?? "").trim();
  const externalId = (searchParams.get("externalId") ?? "").trim();
  if (!source || !externalId) {
    return NextResponse.json({ error: "Missing source or externalId" }, { status: 400 });
  }

  const id = externalJobId(source, externalId);
  await prisma.savedJob.deleteMany({
    where: { userId: session.user.id, jobId: id },
  });

  return NextResponse.json({ success: true });
}
