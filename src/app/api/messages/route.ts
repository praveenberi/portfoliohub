export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages — list contact requests for the logged-in user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const messages = await prisma.contactRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(messages);
}
