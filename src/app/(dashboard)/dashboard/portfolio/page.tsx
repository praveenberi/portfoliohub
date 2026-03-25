export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PortfolioManager } from "@/components/portfolio/manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [portfolio, templates] = await Promise.all([
    prisma.portfolio.findUnique({
      where: { userId },
      include: { template: true },
    }),
    prisma.template.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <PortfolioManager
      portfolio={portfolio}
      templates={templates}
      username={session!.user.username ?? ""}
    />
  );
}
