"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, DownloadSimple, Warning, Article, EnvelopeSimple } from "@phosphor-icons/react";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { ExecutiveTemplate } from "./templates/executive";
import { CoverLetterEditor } from "./cover-letter-editor";

export interface ResumeData {
  name: string;
  avatarUrl: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  skills: string[];
  technologies: string[];
  experiences: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    skills: string[];
  }[];
  education: {
    id: string;
    degree: string;
    field: string;
    institution: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    gpa: string;
  }[];
  projects: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    liveUrl: string;
    githubUrl: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
  }[];
  extras: {
    id: string;
    title: string;
    category: string;
    subtitle: string;
    description: string;
    date: string;
    url: string;
  }[];
}

const templates = [
  { id: "classic",   label: "Classic",   description: "ATS-friendly serif, centered header" },
  { id: "modern",    label: "Sidebar",   description: "Colored sidebar with photo & skill bars" },
  { id: "executive", label: "Executive", description: "Accent bar header, two-column layout" },
] as const;

type TemplateId = (typeof templates)[number]["id"];

const COLOR_PRESETS = [
  { label: "Teal",   value: "#0D9488" },
  { label: "Green",  value: "#16a34a" },
  { label: "Blue",   value: "#2563EB" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Purple", value: "#7C3AED" },
  { label: "Red",    value: "#DC2626" },
  { label: "Orange", value: "#EA580C" },
  { label: "Slate",  value: "#475569" },
];

type MainTab = "resume" | "cover-letter";

export function ResumeViewer({ data }: { data: ResumeData }) {
  const [mainTab, setMainTab]         = useState<MainTab>("resume");
  const [active, setActive]           = useState<TemplateId>("classic");
  const [accentColor, setAccentColor] = useState("#0D9488");

  const allSkills = [...data.skills, ...data.technologies].filter(Boolean);
  const missing: string[] = [
    !data.phone                                           && "Phone",
    allSkills.length === 0                                && "Skills",
    !data.linkedinUrl && !data.githubUrl && !data.website && "Links (LinkedIn / GitHub / Website)",
  ].filter(Boolean) as string[];

  const handlePrint = () => {
    // On mobile, window.open() + document.write() produces a blank page.
    // Sidebar is hidden (hidden md:flex), header/tab bar have print:hidden —
    // so window.print() directly works cleanly on mobile.
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) { window.print(); return; }

    const resumeEl = document.getElementById("resume-print");
    if (!resumeEl) { window.print(); return; }

    const win = window.open("", "_blank");
    if (!win) { window.print(); return; }

    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((el) => el.outerHTML).join("\n");
    const styleBlocks = Array.from(document.querySelectorAll("head > style"))
      .map((el) => el.outerHTML).join("\n");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  ${styleLinks}
  ${styleBlocks}
  <style>
    html, body { margin: 0; padding: 0; background: white; }
    @page { margin: 0; size: A4; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  </style>
</head>
<body>${resumeEl.outerHTML}</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
  };

  return (
    <>
      <div className="space-y-5">
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Resume & Cover Letter</h1>
            <p className="text-sm text-zinc-500 mt-1">Build your resume and generate a tailored cover letter.</p>
          </div>
          {mainTab === "resume" && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all shrink-0"
            >
              <DownloadSimple size={16} />
              Download PDF
            </button>
          )}
        </div>

        {/* ── Main tabs ── */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit print:hidden">
          <button
            onClick={() => setMainTab("resume")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mainTab === "resume"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Article size={16} />
            Resume
          </button>
          <button
            onClick={() => setMainTab("cover-letter")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mainTab === "cover-letter"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <EnvelopeSimple size={16} />
            Cover Letter
          </button>
        </div>

        {/* ── Missing fields banner (resume only) ── */}
        {mainTab === "resume" && missing.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm print:hidden">
            <Warning size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <span className="text-amber-800">
              <span className="font-semibold">Missing from resume: </span>
              {missing.join(" · ")}
              {" — "}
              <Link href="/dashboard/profile" className="underline font-semibold hover:text-amber-900">
                Fill in Profile Settings
              </Link>
              {" (Basic + Social + Skills tabs)"}
            </span>
          </div>
        )}

        {/* ── Colour picker (shared) ── */}
        <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 print:hidden">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-zinc-500 shrink-0">Accent colour</span>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setAccentColor(c.value)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: accentColor === c.value ? "#09090b" : "transparent",
                    boxShadow: accentColor === c.value ? "0 0 0 2px white, 0 0 0 4px #09090b" : "none",
                  }}
                />
              ))}
              <label className="relative w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 hover:border-zinc-500 cursor-pointer flex items-center justify-center overflow-hidden"
                title="Custom colour">
                <span className="text-[9px] text-zinc-400 font-bold">+</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
              <span className="text-xs text-zinc-400 font-mono">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* ══════════ RESUME TAB ══════════ */}
        {mainTab === "resume" && (
          <>
            {/* ── Template switcher ── */}
            <div className="flex gap-3 print:hidden">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    active === t.id
                      ? "border-accent-500 bg-accent-50"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <div className={`text-sm font-semibold ${active === t.id ? "text-accent-700" : "text-zinc-950"}`}>
                    {t.label}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{t.description}</div>
                </button>
              ))}
            </div>

            {/* ── Resume preview ── */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none print:overflow-visible">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/60 print:hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                <div className="ml-3 text-xs text-zinc-400">
                  Resume Preview — {templates.find((t) => t.id === active)?.label}
                </div>
                <button
                  onClick={handlePrint}
                  className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 transition-colors"
                >
                  <Printer size={13} />
                  Print
                </button>
              </div>

              <div id="resume-print" className="max-w-[210mm] mx-auto">
                {active === "classic"   && <ClassicTemplate   data={data} accentColor={accentColor} />}
                {active === "modern"    && <ModernTemplate    data={data} accentColor={accentColor} />}
                {active === "executive" && <ExecutiveTemplate data={data} accentColor={accentColor} />}
              </div>
            </div>

            <p className="text-xs text-zinc-400 text-center print:hidden">
              Tip: "Download PDF" → print dialog → Save as PDF → Margins: None → best result.
            </p>
          </>
        )}

        {/* ══════════ COVER LETTER TAB ══════════ */}
        {mainTab === "cover-letter" && (
          <CoverLetterEditor data={data} accentColor={accentColor} />
        )}
      </div>
    </>
  );
}
