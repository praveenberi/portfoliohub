import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardOverview } from "@/components/dashboard/overview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [
    applications,
    portfolio,
    savedJobs,
    recentApplications,
  ] = await Promise.all([
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.portfolio.findUnique({
      where: { userId },
      select: { views: true, isPublished: true, slug: true },
    }),
    prisma.savedJob.count({ where: { userId } }),
    prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
  ]);

  const statsByStatus = Object.fromEntries(
    applications.map((a) => [a.status, a._count])
  );

  const stats = {
    totalApplications: applications.reduce((sum, a) => sum + a._count, 0),
    portfolioViews: portfolio?.views ?? 0,
    savedJobs,
    activeApplications: (statsByStatus["APPLIED"] ?? 0) + (statsByStatus["UNDER_REVIEW"] ?? 0),
    interviewsScheduled: statsByStatus["INTERVIEW_SCHEDULED"] ?? 0,
    offersReceived: statsByStatus["OFFER_RECEIVED"] ?? 0,
    applicationsByStatus: statsByStatus,
  };

  return (
    <DashboardOverview
      stats={stats}
      portfolio={portfolio}
      recentApplications={recentApplications as Parameters<typeof DashboardOverview>[0]["recentApplications"]}
      user={{ name: session!.user.name, username: session!.user.username }}
    />
  );
}
