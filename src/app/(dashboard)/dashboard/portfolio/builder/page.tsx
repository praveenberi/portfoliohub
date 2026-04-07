export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PortfolioBuilder } from "@/components/portfolio/builder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Portfolio Builder" };

export default async function BuilderPage() {
  const session = await auth();
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session!.user.id },
    include: { template: true },
  });

  if (!portfolio) redirect("/dashboard/portfolio");

  const profile = await prisma.profile.findUnique({
    where: { userId: session!.user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      extras: { orderBy: { order: "asc" } },
    },
  });

  // Read fresh user data from DB so username updates from Settings are reflected
  const dbUser = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, username: true, role: true },
  });

  type SessionRole = NonNullable<typeof session>["user"]["role"];

  return (
    <PortfolioBuilder
      portfolio={portfolio}
      profile={profile}
      user={{
        id: dbUser!.id,
        name: dbUser!.name,
        email: dbUser!.email,
        username: dbUser!.username,
        role: dbUser!.role as SessionRole,
      }}
    />
  );
}
