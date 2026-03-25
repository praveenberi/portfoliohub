export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { AdminOverview } from "@/components/admin/overview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const [users, portfolios, jobs, applications, templates] = await Promise.all([
    prisma.user.count(),
    prisma.portfolio.count({ where: { isPublished: true } }),
    prisma.job.count({ where: { isApproved: true } }),
    prisma.application.count(),
    prisma.template.count({ where: { isActive: true } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true, role: true, isActive: true },
  });

  const topTemplates = await prisma.template.findMany({
    orderBy: { usageCount: "desc" },
    take: 5,
    select: { id: true, name: true, category: true, usageCount: true },
  });

  return (
    <AdminOverview
      stats={{ users, portfolios, jobs, applications, templates }}
      recentUsers={recentUsers}
      topTemplates={topTemplates}
    />
  );
}
