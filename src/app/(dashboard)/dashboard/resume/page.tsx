export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";
import { ResumeViewer } from "@/components/resume/resume-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resume — Showup" };

export default async function ResumePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined;

  const data = {
    name: [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.name || "Your Name",
    avatarUrl: profile?.avatarUrl ?? "",
    email: user?.email ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    website: profile?.website ?? "",
    phone: profile?.phone ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    skills: parseArr(profile?.skills ?? "[]"),
    technologies: parseArr(profile?.technologies ?? "[]"),
    experiences: (profile?.experiences ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      location: e.location ?? "",
      startDate: fmt(e.startDate) ?? "",
      endDate: e.isCurrent ? "Present" : fmt(e.endDate) ?? "",
      isCurrent: e.isCurrent,
      description: e.description ?? "",
      skills: parseArr(e.skills ?? "[]"),
    })),
    education: (profile?.education ?? []).map((e) => ({
      id: e.id,
      degree: e.degree,
      field: e.field ?? "",
      institution: e.institution,
      startDate: fmt(e.startDate) ?? "",
      endDate: e.isCurrent ? "Present" : fmt(e.endDate) ?? "",
      isCurrent: e.isCurrent,
      gpa: e.gpa ?? "",
    })),
    projects: (profile?.projects ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      technologies: parseArr(p.technologies ?? "[]"),
      liveUrl: p.liveUrl ?? "",
      githubUrl: p.githubUrl ?? "",
    })),
    certifications: (profile?.certifications ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: fmt(c.issueDate) ?? "",
    })),
  };

  return <ResumeViewer data={data} />;
}
