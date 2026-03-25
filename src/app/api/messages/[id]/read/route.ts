import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/messages/[id]/read — mark a message as read
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const msg = await prisma.contactRequest.findUnique({ where: { id: params.id } });
  if (!msg || msg.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  await prisma.contactRequest.update({
    where: { id: params.id },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}

// DELETE /api/messages/[id]/read — delete a message
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const msg = await prisma.contactRequest.findUnique({ where: { id: params.id } });
  if (!msg || msg.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  await prisma.contactRequest.delete({ where: { id: params.id } });

  return Response.json({ success: true });
}
