export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobSearch } from "@/components/jobs/job-search";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Jobs" };

interface SearchParams {
  q?: string;
  location?: string;
  workMode?: string;
  type?: string;
  minSalary?: string;
  page?: string;
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

  const where = {
    isApproved: true,
    isActive: true,
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" as const } },
        { company: { contains: searchParams.q, mode: "insensitive" as const } },
        { description: { contains: searchParams.q, mode: "insensitive" as const } },
      ],
    }),
    ...(searchParams.location && {
      location: { contains: searchParams.location, mode: "insensitive" as const },
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
    />
  );
}
