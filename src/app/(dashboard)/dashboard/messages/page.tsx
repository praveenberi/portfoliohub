"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeSimple, CalendarBlank, Phone, Trash, CheckCircle,
  ArrowSquareOut, Clock, User, WhatsappLogo,
} from "@phosphor-icons/react";

interface ContactRequest {
  id: string;
  type: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  message: string | null;
  date: string | null;
  time: string | null;
  purpose: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "message" | "booking">("all");

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/messages/${id}/read`, { method: "PATCH" });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
    if (selected?.id === id) setSelected((s) => s ? { ...s, isRead: true } : s);
  }

  async function deleteMsg(id: string) {
    await fetch(`/api/messages/${id}/read`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openMessage(msg: ContactRequest) {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "message") return m.type === "message";
    if (filter === "booking") return m.type === "booking";
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / 3600000;
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    if (diffH < 48) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Messages</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Contact requests from your portfolio visitors
            {unreadCount > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-100 p-1 rounded-xl w-fit">
        {(["all", "unread", "message", "booking"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === f
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {f === "all" ? `All (${messages.length})` :
             f === "unread" ? `Unread (${unreadCount})` :
             f === "message" ? `Messages (${messages.filter(m => m.type === "message").length})` :
             `Bookings (${messages.filter(m => m.type === "booking").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <EnvelopeSimple size={40} className="text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">No messages yet</p>
          <p className="text-zinc-400 text-sm mt-1">
            When visitors contact you via your portfolio, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Message list */}
          <div className="lg:col-span-1 space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selected?.id === msg.id
                    ? "border-zinc-950 bg-zinc-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-zinc-600">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-zinc-950" : "font-medium text-zinc-700"}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex-shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {msg.type === "booking" ? (
                        <CalendarBlank size={11} className="text-blue-500 flex-shrink-0" />
                      ) : (
                        <EnvelopeSimple size={11} className="text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-xs text-zinc-500 truncate">
                        {msg.type === "booking"
                          ? `Meeting: ${msg.date ?? ""} ${msg.time ?? ""}`
                          : msg.message ?? ""}
                      </span>
                    </div>
                    {!msg.isRead && (
                      <div className="mt-1 w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-2xl border border-zinc-200 p-6"
                >
                  {/* Detail header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-base font-bold text-zinc-600">
                        {selected.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-950">{selected.senderName}</p>
                        <p className="text-xs text-zinc-500">{formatDate(selected.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!selected.isRead && (
                        <button
                          onClick={() => markRead(selected.id)}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                          <CheckCircle size={13} />
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMsg(selected.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash size={13} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="mb-4">
                    {selected.type === "booking" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        <CalendarBlank size={11} />
                        Meeting Request
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                        <EnvelopeSimple size={11} />
                        Message
                      </span>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2.5 text-sm text-zinc-700">
                      <User size={14} className="text-zinc-400 flex-shrink-0" />
                      <a href={`mailto:${selected.senderEmail}`} className="hover:text-zinc-950 hover:underline flex items-center gap-1">
                        {selected.senderEmail}
                        <ArrowSquareOut size={11} className="text-zinc-400" />
                      </a>
                    </div>
                    {selected.senderPhone && (
                      <div className="flex items-center gap-2.5 text-sm text-zinc-700">
                        <Phone size={14} className="text-zinc-400 flex-shrink-0" />
                        <a href={`tel:${selected.senderPhone}`} className="hover:text-zinc-950 hover:underline">
                          {selected.senderPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {selected.type === "booking" ? (
                    <div className="space-y-3">
                      {(selected.date || selected.time) && (
                        <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl">
                          <Clock size={15} className="text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-blue-800 font-medium">
                            {[selected.date, selected.time].filter(Boolean).join(" at ")}
                          </span>
                        </div>
                      )}
                      {selected.purpose && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Purpose</p>
                          <p className="text-sm text-zinc-700 bg-zinc-50 rounded-xl p-3 leading-relaxed">{selected.purpose}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Message</p>
                      <p className="text-sm text-zinc-700 bg-zinc-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    </div>
                  )}

                  {/* Reply CTA */}
                  <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(selected.senderEmail)}&su=${encodeURIComponent(`Re: Your ${selected.type === "booking" ? "meeting request" : "message"}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium bg-zinc-950 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      <EnvelopeSimple size={14} weight="fill" />
                      Reply via Email
                    </a>
                    {selected.senderPhone && (
                      <a
                        href={`https://wa.me/${selected.senderPhone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium bg-[#25D366] text-white px-4 py-2 rounded-xl hover:bg-[#1ebe5d] transition-colors"
                      >
                        <WhatsappLogo size={14} weight="fill" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center bg-white rounded-2xl border border-dashed border-zinc-200 p-12 text-center"
                >
                  <div>
                    <EnvelopeSimple size={32} className="text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Select a message to view</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
