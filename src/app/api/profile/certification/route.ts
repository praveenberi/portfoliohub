import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, order } = body;

    const cert = await prisma.certification.create({
      data: {
        profileId: profile.id,
        name,
        issuer: issuer || null,
        issueDate: new Date(issueDate ?? Date.now()),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: cert });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
