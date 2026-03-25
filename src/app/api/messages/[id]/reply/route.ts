export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailNotification } from "@/lib/notify";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { replyText } = await req.json();
  if (!replyText?.trim()) {
    return Response.json({ error: "Reply cannot be empty" }, { status: 400 });
  }

  const msg = await prisma.contactRequest.findUnique({ where: { id: params.id } });
  if (!msg || msg.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  await sendEmailNotification({
    toEmail: msg.senderEmail,
    replyTo: owner?.email ?? msg.senderEmail,
    subject: `Re: Your ${msg.type === "booking" ? "meeting request" : "message"}`,
    html: `
      <p>Hi ${msg.senderName},</p>
      <p>${replyText.trim().replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p style="font-size:11px;color:#aaa">Replied by ${owner?.name ?? "Portfolio Owner"} via PortfolioHub</p>
    `,
  });

  return Response.json({ success: true });
}
