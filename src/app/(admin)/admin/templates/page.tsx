export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { AdminTemplatesClient } from "@/components/admin/templates";

export const metadata: Metadata = { title: "Admin — Templates" };

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { portfolios: true } } },
  });

  return <AdminTemplatesClient templates={templates} />;
}
