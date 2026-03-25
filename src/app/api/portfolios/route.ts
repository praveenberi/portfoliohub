export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePortfolioSlug, parseJson } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    include: { template: true },
  });

  return NextResponse.json({ success: true, data: portfolio });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.portfolio.findUnique({ where: { userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Portfolio already exists" }, { status: 409 });

  try {
    const body = await req.json();
    const { templateId } = body;

    const template = templateId
      ? await prisma.template.findUnique({ where: { id: templateId } })
      : null;

    const slug = generatePortfolioSlug(session.user.username ?? session.user.name ?? session.user.email);
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    const defaultSections = [
      { id: "hero", type: "hero", title: "Hero", visible: true, order: 0, content: {} },
      { id: "about", type: "about", title: "About Me", visible: true, order: 1, content: {} },
      { id: "skills", type: "skills", title: "Skills", visible: true, order: 2, content: {} },
      { id: "projects", type: "projects", title: "Projects", visible: true, order: 3, content: {} },
      { id: "experience", type: "experience", title: "Experience", visible: true, order: 4, content: {} },
      { id: "contact", type: "contact", title: "Contact", visible: true, order: 5, content: {} },
    ];

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
        templateId: templateId ?? null,
        slug: uniqueSlug,
        title: `${session.user.name ?? "My"} Portfolio`,
        sections: JSON.stringify(defaultSections),
        config: template?.config ?? JSON.stringify({
          primaryColor: "#22c55e",
          backgroundColor: "#ffffff",
          textColor: "#09090b",
          fontFamily: "geist",
          borderRadius: "md",
          spacing: "normal",
          animationsEnabled: true,
        }),
      },
    });

    // Increment template usage
    if (templateId) {
      await prisma.template.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, data: portfolio }, { status: 201 });
  } catch (error) {
    console.error("Portfolio create error:", error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
