export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata = { title: "Welcome to PortfolioHub" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // If already onboarded (has profile data), go to dashboard
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { headline: true },
  });

  if (profile?.headline) redirect("/dashboard");

  const templates = await prisma.template.findMany({
    select: { id: true, name: true, slug: true, description: true, category: true, thumbnailUrl: true },
    orderBy: { createdAt: "asc" },
  });

  return <OnboardingFlow templates={templates.map(t => ({ ...t, description: t.description ?? "" }))} userName={session.user.name} />;
}
