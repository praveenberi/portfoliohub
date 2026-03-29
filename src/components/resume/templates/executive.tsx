import type { ResumeData } from "../resume-viewer";

const ACCENT = "#22c55e"; // brand green

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed min-h-[297mm]"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="px-12 pt-10 pb-7" style={{ borderBottom: `3px solid ${ACCENT}` }}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[38px] font-light tracking-tight text-zinc-950 leading-none">{data.name}</h1>
            {data.headline && (
              <p className="text-sm font-semibold mt-1 tracking-wide" style={{ color: ACCENT }}>{data.headline}</p>
            )}
          </div>
          {/* Contact block */}
          <div className="text-right text-[11px] text-zinc-500 space-y-0.5">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p>{data.website.replace(/^https?:\/\//, "")}</p>}
            {data.linkedinUrl && <p>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</p>}
            {data.githubUrl && <p>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}</p>}
          </div>
        </div>
        {data.bio && (
          <p className="text-zinc-600 mt-4 leading-relaxed max-w-2xl text-[12px]">{data.bio}</p>
        )}
      </div>

      <div className="px-12 py-8 space-y-6">

        {/* ── Experience ── */}
        {data.experiences.length > 0 && (
          <Section title="Professional Experience" accent={ACCENT}>
            <div className="space-y-6">
              {data.experiences.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-zinc-950 text-[13px]">{e.title}</p>
                      <p className="text-zinc-500 text-[12px]">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-6 tabular-nums pt-0.5">
                      {e.startDate} – {e.endDate}
                    </span>
                  </div>
                  {e.description && (
                    <ul className="mt-2 space-y-1 ml-3">
                      {e.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex gap-2 text-zinc-600">
                          <span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-zinc-400 inline-block" />
                          <span>{line.replace(/^[-•]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── 2-col: Education + Skills ── */}
        <div className="grid grid-cols-2 gap-8">
          {data.education.length > 0 && (
            <Section title="Education" accent={ACCENT}>
              <div className="space-y-3">
                {data.education.map((e) => (
                  <div key={e.id}>
                    <p className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                    <p className="text-zinc-500 text-[12px]">{e.institution}</p>
                    <p className="text-zinc-400 text-[11px]">
                      {e.startDate} – {e.endDate}{e.gpa ? ` · GPA ${e.gpa}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {allSkills.length > 0 && (
            <Section title="Core Competencies" accent={ACCENT}>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s, i) => (
                  <span key={i}
                    className="px-2 py-0.5 text-[11px] rounded border text-zinc-700"
                    style={{ borderColor: "#d1fae5", backgroundColor: "#f0fdf4" }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Projects ── */}
        {data.projects.length > 0 && (
          <Section title="Notable Projects" accent={ACCENT}>
            <div className="grid grid-cols-2 gap-4">
              {data.projects.map((p) => (
                <div key={p.id} className="pl-3" style={{ borderLeft: `2px solid ${ACCENT}` }}>
                  <p className="font-bold text-zinc-950">{p.title}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-[11px] text-zinc-400 mb-0.5">{p.technologies.join(", ")}</p>
                  )}
                  {p.description && <p className="text-zinc-600 text-[12px]">{p.description}</p>}
                  {(p.liveUrl || p.githubUrl) && (
                    <p className="text-[11px] mt-0.5" style={{ color: ACCENT }}>
                      {(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications ── */}
        {data.certifications.length > 0 && (
          <Section title="Certifications" accent={ACCENT}>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {data.certifications.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold text-zinc-950">{c.name}</span>
                  <span className="text-zinc-400 text-[11px]"> · {c.issuer} · {c.issueDate}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>{title}</h2>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>
      {children}
    </div>
  );
}
