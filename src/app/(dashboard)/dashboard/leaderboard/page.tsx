export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Trophy, Medal, Briefcase, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Leaderboard - myskillspage" };

const POINTS_PER_APPLICATION = 10;
const PAGE_SIZE = 10;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await auth();
  const currentUserId = session!.user.id;
  const requestedPage = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      profile: {
        select: {
          headline: true,
          location: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  const sortedUsers = users
    .map((user) => ({
      ...user,
      applications: user._count.applications,
      points: user._count.applications * POINTS_PER_APPLICATION,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (a.name ?? a.email).localeCompare(b.name ?? b.email);
    });

  let previousPoints: number | null = null;
  let previousRank = 0;
  const leaderboard = sortedUsers.map((user, index) => {
    const rank = previousPoints === user.points ? previousRank : index + 1;
    previousPoints = user.points;
    previousRank = rank;
    return { ...user, rank };
  });

  const currentUser = leaderboard.find((user) => user.id === currentUserId);
  const topThree = leaderboard.slice(0, 3);
  const totalPages = Math.max(1, Math.ceil(leaderboard.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = leaderboard.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Leaderboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Rankings are based on job applications. Each application is worth {POINTS_PER_APPLICATION} points.
          </p>
        </div>
        {currentUser && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
            <div className="text-xs font-medium text-zinc-500">Your rank</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-zinc-950">#{currentUser.rank}</span>
              <span className="text-sm font-semibold text-amber-600">{currentUser.points} points</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topThree.map((user) => (
          <div
            key={user.id}
            className={cn(
              "rounded-2xl border bg-white p-5",
              user.id === currentUserId ? "border-amber-300 shadow-[0_0_0_2px_rgba(251,191,36,0.12)]" : "border-zinc-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Medal size={20} weight="duotone" />
              </div>
              <span className="text-sm font-bold text-zinc-950">#{user.rank}</span>
            </div>
            <div className="mt-5 min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-950">{user.name ?? user.email}</div>
              <div className="mt-1 truncate text-xs text-zinc-500">{user.profile?.headline ?? user.username ?? "Portfolio member"}</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="text-xs text-zinc-500">{user.applications} applications</span>
              <span className="text-sm font-bold text-amber-600">{user.points} pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4">
          <Trophy size={18} className="text-amber-600" weight="duotone" />
          <h2 className="text-sm font-semibold text-zinc-950">All Users</h2>
          <span className="ml-auto text-xs text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="divide-y divide-zinc-100">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className={cn(
                "grid grid-cols-[48px_1fr_auto] items-center gap-4 px-5 py-4",
                user.id === currentUserId ? "bg-amber-50/60" : "bg-white"
              )}
            >
              <div className="text-sm font-bold text-zinc-950">#{user.rank}</div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-zinc-600">{getInitials(user.name ?? user.email)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-950">{user.name ?? user.email}</span>
                    {user.id === currentUserId && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">You</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <UserCircle size={13} />
                      {user.profile?.headline ?? user.username ?? "Member"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={13} />
                      {user.applications} applied
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-zinc-950">{user.points}</div>
                <div className="text-[10px] font-medium uppercase text-zinc-400">points</div>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, leaderboard.length)} of {leaderboard.length}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/leaderboard?page=${Math.max(1, currentPage - 1)}`}
                aria-disabled={currentPage === 1}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition-colors",
                  currentPage === 1
                    ? "pointer-events-none border-zinc-100 text-zinc-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                )}
              >
                Previous
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, index, pages) => {
                  const showGap = index > 0 && p - pages[index - 1] > 1;
                  return (
                    <span key={p} className="inline-flex items-center gap-2">
                      {showGap && <span className="text-xs text-zinc-400">...</span>}
                      <Link
                        href={`/dashboard/leaderboard?page=${p}`}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                          p === currentPage
                            ? "bg-zinc-950 text-white"
                            : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                        )}
                      >
                        {p}
                      </Link>
                    </span>
                  );
                })}
              <Link
                href={`/dashboard/leaderboard?page=${Math.min(totalPages, currentPage + 1)}`}
                aria-disabled={currentPage === totalPages}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition-colors",
                  currentPage === totalPages
                    ? "pointer-events-none border-zinc-100 text-zinc-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                )}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
