export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata = { title: "Settings — myskillspage" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, username: true, image: true, role: true, createdAt: true },
  });

  return <SettingsPanel user={user} />;
}
