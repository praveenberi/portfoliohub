import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PublicPortfolio } from "@/components/portfolio/public-portfolio";
import type { Metadata } from "next";
import { headers } from "next/headers";

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const portfolio = await getPortfolioData(params.username);
  if (!portfolio) return { title: "Portfolio not found" };

  return {
    title: portfolio.seoTitle ?? `${portfolio.user.name} — Portfolio`,
    description: portfolio.seoDescription ?? `${portfolio.user.name}'s professional portfolio`,
    openGraph: {
      title: portfolio.seoTitle ?? `${portfolio.user.name} — Portfolio`,
      description: portfolio.seoDescription ?? undefined,
      type: "profile",
    },
  };
}

async function getPortfolioData(username: string) {
  return prisma.portfolio.findFirst({
    where: {
      isPublished: true,
      user: { username },
    },
    include: {
      user: {
        include: {
          profile: {
            include: {
              experiences: { orderBy: { order: "asc" } },
              education: { orderBy: { order: "asc" } },
              projects: { orderBy: { order: "asc" } },
              certifications: { orderBy: { order: "asc" } },
              extras: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      template: true,
    },
  });
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const portfolio = await getPortfolioData(params.username);
  if (!portfolio) notFound();

  // Track view (fire and forget)
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? undefined;

  prisma.portfolio
    .update({
      where: { id: portfolio.id },
      data: {
        views: { increment: 1 },
        analytics: {
          create: {
            visitorIp: ip,
            userAgent: headersList.get("user-agent") ?? undefined,
            referrer: headersList.get("referer") ?? undefined,
          },
        },
      },
    })
    .catch(() => null);

  return <PublicPortfolio portfolio={portfolio as Parameters<typeof PublicPortfolio>[0]["portfolio"]} />;
}
