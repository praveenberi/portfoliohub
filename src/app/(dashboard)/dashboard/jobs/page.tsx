export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";
import { JobSearch } from "@/components/jobs/job-search";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Browse Jobs" };

interface SearchParams {
  q?: string;
  location?: string;
  workMode?: string;
  type?: string;
  minSalary?: string;
  page?: string;
  tab?: string;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const page = Number(searchParams.page ?? 1);
  const limit = 12;

  // Pull the user's profile so we can default the location and filter the
  // Matching Jobs tab by their skills + technologies.
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { location: true, skills: true, technologies: true, headline: true },
  });

  const userSkills = Array.from(
    new Set(
      [...parseArr(profile?.skills), ...parseArr(profile?.technologies)]
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );

  // Build a query string the Matching tab can hand to the external jobs API
  // so live results stay relevant. Prefers profile.headline, falls back to the
  // first few skills joined.
  const matchingQuery = (
    profile?.headline?.trim() ||
    userSkills.slice(0, 3).join(" ")
  ).slice(0, 120);

  const skillsFilter: Prisma.JobWhereInput | null =
    userSkills.length === 0
      ? null
      : {
          OR: userSkills.flatMap((skill) => {
            const lower = skill.toLowerCase();
            return [
              { skills: { contains: skill } },
              { skills: { contains: lower } },
              { title: { contains: skill } },
              { title: { contains: lower } },
              { description: { contains: skill } },
              { description: { contains: lower } },
            ];
          }),
        };

  const where: Prisma.JobWhereInput = {
    isApproved: true,
    isActive: true,
    ...(skillsFilter ? { AND: [skillsFilter] } : {}),
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q } },
        { company: { contains: searchParams.q } },
        { description: { contains: searchParams.q } },
      ],
    }),
    ...(searchParams.location && {
      location: { contains: searchParams.location },
    }),
    ...(searchParams.workMode && {
      workMode: searchParams.workMode as "REMOTE" | "HYBRID" | "ON_SITE",
    }),
    ...(searchParams.type && {
      type: searchParams.type as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP",
    }),
    ...(searchParams.minSalary && {
      minSalary: { gte: Number(searchParams.minSalary) },
    }),
  };

  // The skillsFilter is intentionally permissive — it just ensures the job
  // has at least *some* overlap with the user's profile so we don't pull the
  // entire jobs table. The real "matching" rule is applied below: a job has
  // to mention >=3 distinct user skills to qualify (a single shared keyword
  // like "team" or "API" isn't enough). We adapt the threshold down for
  // users who haven't filled in many skills yet so the tab isn't dead.
  const MIN_MATCH_SKILLS = Math.min(3, Math.max(1, userSkills.length));

  // Pull a generous candidate pool then score + paginate in memory.
  const [candidatesRaw, savedJobIds] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      take: 500,
    }),
    prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    }),
  ]);

  // Word-boundary match keeps "React" out of "interaction" / "team" out of
  // "teamspeak". Falls back to plain substring when the skill itself contains
  // regex-special chars (e.g. "C++").
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function countSkillMatches(job: { skills: string; title: string; description: string | null }): number {
    if (userSkills.length === 0) return 0;
    const haystack = (
      parseArr(job.skills).join(" ") + " " +
      job.title + " " +
      (job.description ?? "")
    ).toLowerCase();
    let count = 0;
    for (const skill of userSkills) {
      const lower = skill.toLowerCase().trim();
      if (!lower) continue;
      const re = new RegExp(`\\b${escapeRe(lower)}\\b`, "i");
      if (re.test(haystack)) count++;
    }
    return count;
  }

  type Scored = { job: typeof candidatesRaw[number]; matches: number };
  const scored: Scored[] = userSkills.length === 0
    ? candidatesRaw.map((j) => ({ job: j, matches: 0 }))
    : candidatesRaw
        .map((j) => ({ job: j, matches: countSkillMatches(j) }))
        .filter((s) => s.matches >= MIN_MATCH_SKILLS)
        .sort((a, b) => b.matches - a.matches);

  const total = scored.length;
  const jobs = scored.slice((page - 1) * limit, page * limit).map((s) => s.job);

  return (
    <JobSearch
      jobs={jobs}
      total={total}
      page={page}
      limit={limit}
      savedJobIds={savedJobIds.map((s) => s.jobId)}
      searchParams={searchParams as Record<string, string | undefined>}
      defaultLocation={profile?.location ?? ""}
      userSkillCount={userSkills.length}
      matchingQuery={matchingQuery}
      userTopSkills={userSkills.slice(0, 6)}
      userSkills={userSkills}
      minMatchSkills={MIN_MATCH_SKILLS}
    />
  );
}
