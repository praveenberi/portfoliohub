export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: { job: true },
  });

  const jobs = saved
    .filter((s) => !!s.job)
    .map((s) => {
      const j = s.job!;
      const isExternal = j.id.startsWith("ext-");
      const sourceFromId = isExternal ? j.id.split("-")[1] ?? "external" : "Posted";
      return {
        id: j.id,
        title: j.title,
        company: j.company,
        companyLogo: j.companyLogo ?? undefined,
        location: j.location ?? "",
        workMode: j.workMode as "REMOTE" | "HYBRID" | "ON_SITE",
        type: j.type,
        description: j.description ?? "",
        skills: parseArr(j.skills),
        applyUrl: j.applyUrl ?? j.externalUrl ?? "",
        externalUrl: j.externalUrl ?? null,
        source: isExternal ? prettySource(sourceFromId) : "Posted",
        savedAt: s.savedAt,
        salary: j.minSalary || j.maxSalary
          ? formatSalary(j.minSalary, j.maxSalary, j.currency)
          : null,
        postedAt: j.postedAt,
      };
    });

  return NextResponse.json({ success: true, data: jobs });
}

function prettySource(slug: string): string {
  const map: Record<string, string> = {
    mycareersfuture: "MyCareersFuture",
    jsearch: "JSearch",
    adzuna: "Adzuna",
    themuse: "The Muse",
    remoteok: "RemoteOK",
  };
  return map[slug] ?? slug.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  const c = currency || "USD";
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${c} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `${c} ${fmt(min)}+`;
  if (max) return `Up to ${c} ${fmt(max)}`;
  return "";
}
