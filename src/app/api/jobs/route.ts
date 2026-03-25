import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const q = searchParams.get("q");
  const workMode = searchParams.get("workMode");
  const type = searchParams.get("type");
  const location = searchParams.get("location");
  const minSalary = searchParams.get("minSalary");

  const where = {
    isApproved: true,
    isActive: true,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { company: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(workMode && { workMode: workMode as "REMOTE" | "HYBRID" | "ON_SITE" }),
    ...(type && { type: type as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP" }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
    ...(minSalary && { minSalary: { gte: Number(minSalary) } }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only recruiters can post jobs" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = jobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...data,
        recruiterId: session.user.id,
        isApproved: session.user.role === "ADMIN",
      },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
