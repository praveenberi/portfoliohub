import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findUnique({ where: { id: params.id } });
  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (portfolio.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowedFields = ["sections", "config", "isPublished", "title", "seoTitle", "seoDescription", "customDomain"];
    const updateData = Object.fromEntries(
      Object.entries(body)
        .filter(([key]) => allowedFields.includes(key))
        .map(([key, val]) =>
          (key === "sections" || key === "config") && typeof val !== "string"
            ? [key, JSON.stringify(val)]
            : [key, val]
        )
    );

    if (body.isPublished === true && !portfolio.isPublished) {
      (updateData as Record<string, unknown>).publishedAt = new Date();
    }

    const updated = await prisma.portfolio.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findUnique({ where: { id: params.id } });
  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (portfolio.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.portfolio.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
