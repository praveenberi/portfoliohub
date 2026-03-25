import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(id: string, userId: string) {
  const cert = await prisma.certification.findUnique({ where: { id }, include: { profile: true } });
  if (!cert || cert.profile.userId !== userId) return null;
  return cert;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await getOwned(params.id, session.user.id);
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl } = body;

    const updated = await prisma.certification.update({
      where: { id: params.id },
      data: {
        name,
        issuer: issuer || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cert = await getOwned(params.id, session.user.id);
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.certification.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
