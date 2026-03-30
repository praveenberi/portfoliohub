"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatCircle, X, PaperPlaneTilt, CalendarBlank,
  Spinner, CheckCircle, EnvelopeSimple,
} from "@phosphor-icons/react";

interface ChatWidgetProps {
  username: string;
  ownerName: string;
  accentColor?: string;
}

type Tab = "message" | "booking";
type Status = "idle" | "sending" | "success" | "error";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

function Field({ label, value, onChange, placeholder, type = "text", disabled }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 transition-all"
      />
    </div>
  );
}

interface MessageFormProps {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  message: string; setMessage: (v: string) => void;
  accentColor: string;
  status: Status;
  onSubmit: () => void;
}

function MessageForm({ name, setName, email, setEmail, phone, setPhone, message, setMessage, accentColor, status, onSubmit }: MessageFormProps) {
  const sending = status === "sending";
  const valid = name.trim() && email.trim() && message.trim();

  return (
    <div className="space-y-3">
      <Field label="Your Name" value={name} onChange={setName} placeholder="Jane Smith" disabled={sending} />
      <Field label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" disabled={sending} />
      <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+65 9123 4567" type="tel" disabled={sending} />
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi, I'd love to connect about..."
          disabled={sending}
          rows={4}
          className="w-full bg-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-600 resize-none disabled:opacity-50 transition-all"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!valid || sending}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 hover:opacity-90 flex items-center justify-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        {sending ? (
          <Spinner size={14} className="animate-spin" />
        ) : (
          <PaperPlaneTilt size={14} weight="fill" />
        )}
        {sending ? "Sending…" : "Send Message"}
      </button>
    </div>
  );
}

interface BookingFormProps {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  date: string; setDate: (v: string) => void;
  time: string; setTime: (v: string) => void;
  purpose: string; setPurpose: (v: string) => void;
  accentColor: string;
  status: Status;
  onSubmit: () => void;
}

function BookingForm({ name, setName, email, setEmail, phone, setPhone, date, setDate, time, setTime, purpose, setPurpose, accentColor, status, onSubmit }: BookingFormProps) {
  const sending = status === "sending";
  const valid = name.trim() && email.trim() && date && time && purpose.trim();
  const today = new Date().toISOString().split("T")[0];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  ];

  return (
    <div className="space-y-3">
      <Field label="Your Name" value={name} onChange={setName} placeholder="Jane Smith" disabled={sending} />
      <Field label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" disabled={sending} />
      <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+65 9123 4567" type="tel" disabled={sending} />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Preferred Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            disabled={sending}
            className="w-full bg-zinc-800 text-sm text-zinc-100 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Preferred Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={sending}
            className="w-full bg-zinc-800 text-sm text-zinc-100 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 transition-all"
          >
            <option value="">Select…</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Purpose / Topic</label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="I'd like to discuss a job opportunity..."
          disabled={sending}
          rows={3}
          className="w-full bg-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-600 resize-none disabled:opacity-50 transition-all"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!valid || sending}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 hover:opacity-90 flex items-center justify-center gap-2"
        style={{ backgroundColor: accentColor }}
      >
        {sending ? (
          <Spinner size={14} className="animate-spin" />
        ) : (
          <CalendarBlank size={14} weight="fill" />
        )}
        {sending ? "Sending…" : "Request Meeting"}
      </button>
    </div>
  );
}

export function ChatWidget({ username, ownerName, accentColor = "#22c55e" }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("message");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Message form state
  const [msgName, setMsgName] = useState("");
  const [msgEmail, setMsgEmail] = useState("");
  const [msgPhone, setMsgPhone] = useState("");
  const [msgText, setMsgText] = useState("");

  // Booking form state
  const [bookName, setBookName] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookPurpose, setBookPurpose] = useState("");

  async function submit(type: Tab) {
    setStatus("sending");
    setError("");

    const body =
      type === "message"
        ? { username, senderName: msgName, senderEmail: msgEmail, senderPhone: msgPhone, message: msgText, type: "message" }
        : { username, senderName: bookName, senderEmail: bookEmail, senderPhone: bookPhone, date: bookDate, time: bookTime, purpose: bookPurpose, type: "booking" };

    try {
      const res = await fetch("/api/contact-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("success");
      if (type === "message") {
        setMsgName(""); setMsgEmail(""); setMsgPhone(""); setMsgText("");
      } else {
        setBookName(""); setBookEmail(""); setBookPhone(""); setBookDate(""); setBookTime(""); setBookPurpose("");
      }
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "Failed to send. Try again.");
    }
  }

  function handleOpen() {
    setOpen((o) => !o);
    setStatus("idle");
    setError("");
  }

  function switchTab(t: Tab) {
    setTab(t);
    setStatus("idle");
    setError("");
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
        style={{ backgroundColor: accentColor }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
        aria-label="Contact"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} weight="bold" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatCircle size={24} weight="fill" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: accentColor }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ChatCircle size={16} weight="fill" className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  Get in touch with {ownerName}
                </p>
                <p className="text-[11px] text-white/70">
                  Send a message or book a meeting
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900">
              {(["message", "booking"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    tab === t
                      ? "text-white border-b-2"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={tab === t ? { borderColor: accentColor } : {}}
                >
                  {t === "message" ? (
                    <EnvelopeSimple size={13} />
                  ) : (
                    <CalendarBlank size={13} />
                  )}
                  {t === "message" ? "Send Message" : "Book Meeting"}
                </button>
              ))}
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto p-4 bg-zinc-950"
              style={{ maxHeight: "440px" }}
            >
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <CheckCircle size={40} weight="fill" style={{ color: accentColor }} />
                  <p className="text-white font-medium">
                    {tab === "message" ? "Message sent!" : "Meeting request sent!"}
                  </p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {tab === "message"
                      ? `${ownerName} will get back to you soon.`
                      : `${ownerName} will confirm your meeting shortly.`}
                  </p>
                  <button
                    onClick={() => { setStatus("idle"); setError(""); }}
                    className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : tab === "message" ? (
                <MessageForm
                  name={msgName} setName={setMsgName}
                  email={msgEmail} setEmail={setMsgEmail}
                  phone={msgPhone} setPhone={setMsgPhone}
                  message={msgText} setMessage={setMsgText}
                  accentColor={accentColor}
                  status={status}
                  onSubmit={() => submit("message")}
                />
              ) : (
                <BookingForm
                  name={bookName} setName={setBookName}
                  email={bookEmail} setEmail={setBookEmail}
                  phone={bookPhone} setPhone={setBookPhone}
                  date={bookDate} setDate={setBookDate}
                  time={bookTime} setTime={setBookTime}
                  purpose={bookPurpose} setPurpose={setBookPurpose}
                  accentColor={accentColor}
                  status={status}
                  onSubmit={() => submit("booking")}
                />
              )}
              {status === "error" && (
                <p className="text-xs text-red-400 text-center mt-2">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-zinc-600 py-1.5 bg-zinc-900 border-t border-zinc-800">
              Powered by myskillspage
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
