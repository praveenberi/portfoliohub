export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { AdminUsers } from "@/components/admin/users";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const limit = 20;

  const where = {
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: "insensitive" as const } },
        { email: { contains: searchParams.q, mode: "insensitive" as const } },
        { username: { contains: searchParams.q, mode: "insensitive" as const } },
      ],
    }),
    ...(searchParams.role && { role: searchParams.role as "USER" | "RECRUITER" | "ADMIN" }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { applications: true } },
        portfolio: { select: { isPublished: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return <AdminUsers users={users} total={total} page={page} limit={limit} />;
}
