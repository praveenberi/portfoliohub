"use client";

import { useState } from "react";
import { Printer, DownloadSimple } from "@phosphor-icons/react";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { ExecutiveTemplate } from "./templates/executive";

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

export function ResumeViewer({ data }: { data: ResumeData }) {
  const [active, setActive]           = useState<TemplateId>("classic");
  const [accentColor, setAccentColor] = useState("#0D9488");

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-print, #resume-print * { visibility: visible; }
          #resume-print { position: fixed; top: 0; left: 0; width: 100%; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div className="space-y-5">
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Resume</h1>
            <p className="text-sm text-zinc-500 mt-1">Choose a template, pick a colour, download as PDF.</p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all shrink-0"
          >
            <DownloadSimple size={16} />
            Download PDF
          </button>
        </div>

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

        {/* ── Colour picker ── */}
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
              {/* Custom colour input */}
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

        {/* ── Resume preview ── */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none">
          {/* Mock browser bar */}
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

          {/* Resume content */}
          <div id="resume-print" className="max-w-[210mm] mx-auto">
            {active === "classic"   && <ClassicTemplate   data={data} accentColor={accentColor} />}
            {active === "modern"    && <ModernTemplate    data={data} accentColor={accentColor} />}
            {active === "executive" && <ExecutiveTemplate data={data} accentColor={accentColor} />}
          </div>
        </div>

        <p className="text-xs text-zinc-400 text-center print:hidden">
          Tip: "Download PDF" → print dialog → Save as PDF → Margins: None → best result.
        </p>
      </div>
    </>
  );
}
