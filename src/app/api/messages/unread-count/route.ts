export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ count: 0 });
  }

  const count = await prisma.contactRequest.count({
    where: { userId: session.user.id, isRead: false },
  });

  return Response.json({ count });
}
