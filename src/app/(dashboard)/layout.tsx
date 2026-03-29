import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex print:block print:bg-white">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 print:ml-0">
        <DashboardHeader user={{ ...session.user, username: session.user.username ?? null }} />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
