export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { AdminAnalyticsClient } from "@/components/admin/analytics";

export const metadata: Metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsers7d, newUsers30d,
    totalPortfolios, publishedPortfolios,
    totalJobs, pendingJobs,
    totalApplications,
    recentSignups,
    topPortfolios,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.portfolio.count(),
    prisma.portfolio.count({ where: { isPublished: true } }),
    prisma.job.count(),
    prisma.job.count({ where: { isApproved: false, isActive: true } }),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
    prisma.portfolio.findMany({
      where: { isPublished: true },
      orderBy: { views: "desc" },
      take: 10,
      select: { id: true, slug: true, title: true, views: true, user: { select: { name: true } } },
    }),
  ]);

  return (
    <AdminAnalyticsClient
      stats={{ totalUsers, newUsers7d, newUsers30d, totalPortfolios, publishedPortfolios, totalJobs, pendingJobs, totalApplications }}
      recentSignups={recentSignups}
      topPortfolios={topPortfolios}
    />
  );
}
