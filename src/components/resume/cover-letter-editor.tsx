"use client";

import { useState } from "react";
import { Sparkle, DownloadSimple, Printer, PencilSimple, Eye, ArrowClockwise } from "@phosphor-icons/react";
import type { ResumeData } from "./resume-viewer";

interface CoverLetterEditorProps {
  data: ResumeData;
  accentColor: string;
}

export function CoverLetterEditor({ data, accentColor }: CoverLetterEditorProps) {
  const [jobTitle, setJobTitle]   = useState("");
  const [company,  setCompany]    = useState("");
  const [jobDesc,  setJobDesc]    = useState("");
  const [content,  setContent]    = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");
  const [viewMode, setViewMode]   = useState<"edit" | "preview">("edit");
  const [showDesc, setShowDesc]   = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const fullName = data.name || "Your Name";
  const contactLine = [data.email, data.phone, data.location].filter(Boolean).join(" · ");
  const linksLine   = [data.linkedinUrl, data.githubUrl, data.website].filter(Boolean).join(" · ");

  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jobTitle, company, jobDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate");
      setContent(json.content ?? "");
      setViewMode("preview");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById("cover-letter-print");
    if (!el) { window.print(); return; }

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) { window.print(); return; }

    const win = window.open("", "_blank");
    if (!win) { window.print(); return; }

    const styleLinks  = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((el) => el.outerHTML).join("\n");
    const styleBlocks = Array.from(document.querySelectorAll("head > style")).map((el) => el.outerHTML).join("\n");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  ${styleLinks}
  ${styleBlocks}
  <style>
    html, body { margin: 0; padding: 0; background: white; }
    @page { margin: 18mm 20mm; size: A4; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
  };

  return (
    <div className="space-y-5">
      {/* ── Job details card ── */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Target Role</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDesc((v) => !v)}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          {showDesc ? "Hide" : "Add"} job description (optional, improves AI quality)
        </button>

        {showDesc && (
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here…"
            rows={5}
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
          />
        )}

        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {loading ? (
            <>
              <ArrowClockwise size={16} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkle size={16} weight="fill" />
              {content ? "Regenerate with AI" : "Generate with AI"}
            </>
          )}
        </button>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {/* ── Editor / Preview ── */}
      {(content || true) && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 bg-zinc-50/60 print:hidden">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("edit")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "edit"
                    ? "bg-white border border-zinc-200 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <PencilSimple size={12} /> Edit
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "preview"
                    ? "bg-white border border-zinc-200 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <Eye size={12} /> Preview
              </button>
            </div>
            {content && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                <Printer size={13} />
                Print
              </button>
            )}
          </div>

          {/* Edit mode */}
          {viewMode === "edit" && (
            <div className="p-4">
              {!content && (
                <p className="text-sm text-zinc-400 text-center py-12">
                  Fill in the job details above and click{" "}
                  <span className="font-semibold text-zinc-600">Generate with AI</span> to create your cover letter.
                </p>
              )}
              {content && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full px-0 py-0 text-sm text-zinc-700 leading-relaxed border-0 focus:outline-none resize-none font-mono"
                  placeholder="Your cover letter content will appear here…"
                />
              )}
            </div>
          )}

          {/* Preview mode — styled cover letter */}
          {viewMode === "preview" && (
            <div id="cover-letter-print" className="max-w-[210mm] mx-auto px-12 py-10 text-[13px] leading-relaxed text-zinc-800 font-sans">
              {/* Header accent line */}
              <div className="h-1 w-16 rounded-full mb-8" style={{ backgroundColor: accentColor }} />

              {/* Sender info */}
              <div className="mb-8">
                <p className="text-xl font-bold text-zinc-950 tracking-tight">{fullName}</p>
                {contactLine && <p className="text-xs text-zinc-500 mt-1">{contactLine}</p>}
                {linksLine   && <p className="text-xs text-zinc-400 mt-0.5 break-all">{linksLine}</p>}
              </div>

              {/* Date + recipient */}
              <div className="mb-8 space-y-4">
                <p className="text-zinc-500">{today}</p>
                {(company || jobTitle) && (
                  <div>
                    {company  && <p className="font-semibold text-zinc-950">{company}</p>}
                    {jobTitle && <p className="text-zinc-600">Re: {jobTitle} Position</p>}
                  </div>
                )}
              </div>

              {/* Salutation */}
              <p className="mb-6 font-medium text-zinc-950">Dear Hiring Manager,</p>

              {/* Body paragraphs */}
              {paragraphs.length > 0 ? (
                <div className="space-y-4">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-zinc-700 leading-[1.75]">{para.trim()}</p>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-300 italic">
                  Your cover letter content will appear here once generated.
                </p>
              )}

              {/* Closing */}
              <div className="mt-10 space-y-8">
                <p className="text-zinc-700">Sincerely,</p>
                <div>
                  <div className="h-px w-32 mb-2" style={{ backgroundColor: accentColor }} />
                  <p className="font-semibold text-zinc-950">{fullName}</p>
                  {data.headline && <p className="text-xs text-zinc-500 mt-0.5">{data.headline}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download button */}
      {content && (
        <div className="flex justify-end print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <DownloadSimple size={16} />
            Download PDF
          </button>
        </div>
      )}

      <p className="text-xs text-zinc-400 text-center print:hidden">
        Tip: Edit the generated text freely, then Download PDF → Save as PDF for best results.
      </p>
    </div>
  );
}
