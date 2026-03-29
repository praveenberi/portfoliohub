export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr, parseJson } from "@/lib/utils";
import { ResumeViewer } from "@/components/resume/resume-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resume — Showup" };

export default async function ResumePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, profile, portfolio] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences:    { orderBy: { order: "asc" } },
        education:      { orderBy: { order: "asc" } },
        projects:       { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
        extras:         { orderBy: { order: "asc" } },
      },
    }),
    prisma.portfolio.findFirst({ where: { userId }, select: { sections: true } }),
  ]);

  // Parse portfolio sections (stored as JSON string)
  type Section = { type: string; content: Record<string, unknown> };
  const sections: Section[] = parseJson<Section[]>(portfolio?.sections, []);
  const sectionOf = (type: string) => sections.find((s) => s.type === type)?.content ?? {};

  // Bio: prefer profile.bio, fall back to portfolio about section bioOverride
  const bio = profile?.bio || (sectionOf("about").bioOverride as string) || "";

  // Skills: prefer profile fields; fall back to portfolio skills section
  let skills = parseArr(profile?.skills ?? "[]");
  let technologies = parseArr(profile?.technologies ?? "[]");
  if (skills.length === 0 && technologies.length === 0) {
    const customSkills = sectionOf("skills").skills as string | undefined;
    if (customSkills) {
      // Strip grouped-format ## headers; split comma-separated skills
      skills = customSkills
        .split("\n")
        .filter((line) => !line.trim().startsWith("##") && line.trim())
        .flatMap((line) => line.split(",").map((s) => s.trim()))
        .filter(Boolean);
    }
  } else {
    // Filter out any ## header entries that may have been stored in profile.skills
    skills = skills.filter((s) => !s.trim().startsWith("##"));
    technologies = technologies.filter((s) => !s.trim().startsWith("##"));
  }

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined;

  const data = {
    name:         [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.name || "Your Name",
    avatarUrl:    profile?.avatarUrl    ?? "",
    email:        user?.email           ?? "",
    headline:     profile?.headline     ?? "",
    bio,
    location:     profile?.location     ?? "",
    website:      profile?.website      ?? "",
    phone:        profile?.phone        ?? "",
    linkedinUrl:  profile?.linkedinUrl  ?? "",
    githubUrl:    profile?.githubUrl    ?? "",
    twitterUrl:   profile?.twitterUrl   ?? "",
    instagramUrl: profile?.instagramUrl ?? "",
    skills,
    technologies,

    experiences: (profile?.experiences ?? []).map((e) => ({
      id:          e.id,
      title:       e.title,
      company:     e.company,
      location:    e.location    ?? "",
      startDate:   fmt(e.startDate) ?? "",
      endDate:     e.isCurrent ? "Present" : fmt(e.endDate) ?? "",
      isCurrent:   e.isCurrent,
      description: e.description ?? "",
      skills:      parseArr(e.skills ?? "[]"),
    })),

    education: (profile?.education ?? []).map((e) => ({
      id:          e.id,
      degree:      e.degree,
      field:       e.field ?? "",
      institution: e.institution,
      startDate:   fmt(e.startDate) ?? "",
      endDate:     e.isCurrent ? "Present" : fmt(e.endDate) ?? "",
      isCurrent:   e.isCurrent,
      gpa:         e.gpa ?? "",
    })),

    projects: (profile?.projects ?? []).map((p) => ({
      id:           p.id,
      title:        p.title,
      description:  p.description ?? "",
      technologies: parseArr(p.technologies ?? "[]"),
      liveUrl:      p.liveUrl   ?? "",
      githubUrl:    p.githubUrl ?? "",
    })),

    certifications: (profile?.certifications ?? []).map((c) => ({
      id:        c.id,
      name:      c.name,
      issuer:    c.issuer,
      issueDate: fmt(c.issueDate) ?? "",
    })),

    extras: (profile?.extras ?? []).map((x) => ({
      id:          x.id,
      title:       x.title,
      category:    x.category,
      subtitle:    x.subtitle    ?? "",
      description: x.description ?? "",
      date:        fmt(x.date)   ?? "",
      url:         x.url         ?? "",
    })),
  };

  return <ResumeViewer data={data} />;
}
