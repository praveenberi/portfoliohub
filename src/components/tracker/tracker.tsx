"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBar,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  CaretDown,
  Note,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import type { Application, Job, ApplicationTimeline, ApplicationReminder } from "@prisma/client";
import { STATUS_COLORS, STATUS_LABELS, timeAgo, formatSalaryRange } from "@/lib/utils";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type AppWithRelations = Application & {
  job: Job;
  timeline: ApplicationTimeline[];
  reminders: ApplicationReminder[];
};

interface TrackerProps {
  applications: AppWithRelations[];
  stats: {
    total: number;
    applied: number;
    underReview: number;
    interviews: number;
    offers: number;
    rejected: number;
  };
}

const STATUS_PIPELINE = [
  { key: "APPLIED", label: "Applied", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
  { key: "UNDER_REVIEW", label: "In Review", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  { key: "INTERVIEW_SCHEDULED", label: "Interview", icon: Calendar, color: "text-violet-600 bg-violet-50" },
  { key: "OFFER_RECEIVED", label: "Offer", icon: CheckCircle, color: "text-accent-600 bg-accent-50" },
] as const;

const ALL_STATUSES = ["APPLIED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "TECHNICAL_TEST", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "ACCEPTED"];

export function ApplicationTracker({ applications, stats }: TrackerProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filter === "ALL"
    ? applications
    : applications.filter((a) => a.status === filter);

  const handleStatusUpdate = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await axios.patch(`/api/applications/${appId}`, { status });
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Application Tracker</h1>
        <p className="text-sm text-zinc-500 mt-1">Track every step of your job search.</p>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_PIPELINE.map((stage) => {
          const count = applications.filter((a) => a.status === stage.key).length;
          return (
            <motion.button
              key={stage.key}
              onClick={() => setFilter(filter === stage.key ? "ALL" : stage.key)}
              whileTap={{ scale: 0.98 }}
              className={`bg-white rounded-2xl border p-5 text-left transition-all duration-150 ${
                filter === stage.key
                  ? "border-zinc-950 shadow-[0_0_0_2px_rgba(9,9,11,0.08)]"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stage.color}`}>
                <stage.icon size={18} weight="duotone" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-zinc-950">{count}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{stage.label}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Summary stats row */}
      <div className="flex items-center gap-6 text-sm text-zinc-500 border-b border-zinc-200 pb-4">
        <span><strong className="text-zinc-950">{stats.total}</strong> total</span>
        <span><strong className="text-zinc-950">{stats.rejected}</strong> rejected</span>
        <span><strong className="text-accent-600">{stats.offers}</strong> offers</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 px-3 rounded-lg border border-zinc-200 text-xs text-zinc-700 focus:outline-none focus:border-accent-500"
          >
            <option value="ALL">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center">
          <Briefcase size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No applications here</p>
          <Link href="/dashboard/jobs" className="mt-3 inline-flex text-xs font-medium text-accent-600 hover:text-accent-700">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-zinc-50/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-950">{app.job.title}</span>
                      {app.job.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {app.job.company}
                      {app.job.location && ` · ${app.job.location}`}
                      {` · Applied ${timeAgo(app.appliedAt)}`}
                    </div>
                  </div>

                  {app.job.minSalary && (
                    <div className="hidden md:block text-xs text-zinc-500">
                      {formatSalaryRange(app.job.minSalary, app.job.maxSalary, app.job.currency)}
                    </div>
                  )}

                  {/* Status selector */}
                  <select
                    value={app.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                    disabled={updatingId === app.id}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border focus:outline-none cursor-pointer ${STATUS_COLORS[app.status]}`}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>

                  <CaretDown
                    size={14}
                    className={`text-zinc-400 transition-transform ${expandedId === app.id ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-100 p-5 grid md:grid-cols-2 gap-6">
                        {/* Timeline */}
                        <div>
                          <div className="text-xs font-semibold text-zinc-700 mb-3">Timeline</div>
                          {app.timeline.length > 0 ? (
                            <div className="space-y-2">
                              {app.timeline.map((event) => (
                                <div key={event.id} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-xs font-medium text-zinc-700">
                                      {STATUS_LABELS[event.status]}
                                    </div>
                                    <div className="text-[10px] text-zinc-400">
                                      {timeAgo(event.occurredAt)}
                                      {event.note && ` · ${event.note}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">No timeline events yet.</p>
                          )}
                        </div>

                        {/* Notes & reminders */}
                        <div className="space-y-4">
                          {app.notes && (
                            <div>
                              <div className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
                                <Note size={13} />
                                Notes
                              </div>
                              <p className="text-xs text-zinc-500 leading-relaxed">{app.notes}</p>
                            </div>
                          )}

                          {app.interviewDate && (
                            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-xl">
                              <Calendar size={14} className="text-violet-600" />
                              <div>
                                <div className="text-xs font-medium text-violet-700">Interview scheduled</div>
                                <div className="text-[10px] text-violet-600">
                                  {new Date(app.interviewDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          <Link
                            href={`/dashboard/tracker/${app.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
                          >
                            View full details
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
