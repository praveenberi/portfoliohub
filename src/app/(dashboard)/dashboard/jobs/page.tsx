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

  const [jobs, total, savedJobIds] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
    prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    }),
  ]);

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
    />
  );
}
