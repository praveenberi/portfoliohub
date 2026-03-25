import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApplicationTracker } from "@/components/tracker/tracker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Application Tracker" };

export default async function TrackerPage() {
  const session = await auth();
  const userId = session!.user.id;

  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: true,
      timeline: { orderBy: { occurredAt: "asc" } },
      reminders: { where: { isCompleted: false }, orderBy: { scheduledAt: "asc" } },
    },
    orderBy: { appliedAt: "desc" },
  });

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    underReview: applications.filter((a) => a.status === "UNDER_REVIEW").length,
    interviews: applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
    offers: applications.filter((a) => a.status === "OFFER_RECEIVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return <ApplicationTracker applications={applications as Parameters<typeof ApplicationTracker>[0]["applications"]} stats={stats} />;
}
