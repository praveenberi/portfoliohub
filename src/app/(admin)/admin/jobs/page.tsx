import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { AdminJobsClient } from "@/components/admin/jobs";

export const metadata: Metadata = { title: "Admin — Jobs" };

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const limit = 20;
  const status = searchParams.status;

  const where = {
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q } },
        { company: { contains: searchParams.q } },
      ],
    }),
    ...(status === "pending" && { isApproved: false, isActive: true }),
    ...(status === "approved" && { isApproved: true, isActive: true }),
    ...(status === "inactive" && { isActive: false }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { recruiter: { select: { name: true, email: true } } },
    }),
    prisma.job.count({ where }),
  ]);

  return <AdminJobsClient jobs={jobs} total={total} page={page} limit={limit} />;
}
