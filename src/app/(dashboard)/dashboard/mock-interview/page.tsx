export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { MockInterview } from "@/components/mock-interview/mock-interview";

export const metadata: Metadata = { title: "Mock Interview — myskillspage" };

export default async function MockInterviewPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  return <MockInterview isAdmin={isAdmin} />;
}
