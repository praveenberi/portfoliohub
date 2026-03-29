"use client";

import { useState } from "react";
import { Printer, DownloadSimple } from "@phosphor-icons/react";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { ExecutiveTemplate } from "./templates/executive";

export interface ResumeData {
  name: string;
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
  { id: "classic", label: "Classic", description: "ATS-friendly, traditional layout" },
  { id: "modern", label: "Modern", description: "Dark sidebar, two-column" },
  { id: "executive", label: "Executive", description: "Clean typographic style" },
] as const;

type TemplateId = (typeof templates)[number]["id"];

export function ResumeViewer({ data }: { data: ResumeData }) {
  const [active, setActive] = useState<TemplateId>("classic");

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print CSS — hides everything except resume on print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-print, #resume-print * { visibility: visible; }
          #resume-print { position: fixed; top: 0; left: 0; width: 100%; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Controls — hidden on print */}
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Resume</h1>
            <p className="text-sm text-zinc-500 mt-1">Choose a template and download as PDF.</p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <DownloadSimple size={16} />
            Download PDF
          </button>
        </div>

        {/* Template switcher — hidden on print */}
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

        {/* Resume preview — visible on print */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none">
          {/* Mock browser bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/60 print:hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            <div className="ml-3 text-xs text-zinc-400">Resume Preview — {templates.find(t => t.id === active)?.label}</div>
            <button
              onClick={handlePrint}
              className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 transition-colors print:hidden"
            >
              <Printer size={13} />
              Print
            </button>
          </div>

          {/* The actual resume */}
          <div id="resume-print" className="max-w-[210mm] mx-auto">
            {active === "classic" && <ClassicTemplate data={data} />}
            {active === "modern" && <ModernTemplate data={data} />}
            {active === "executive" && <ExecutiveTemplate data={data} />}
          </div>
        </div>

        {/* Tip */}
        <p className="text-xs text-zinc-400 text-center print:hidden">
          Tip: Click "Download PDF" → in the print dialog, choose "Save as PDF" and set margins to None for best results.
        </p>
      </div>
    </>
  );
}
