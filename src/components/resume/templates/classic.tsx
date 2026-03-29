import type { ResumeData } from "../resume-viewer";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed px-12 py-10 min-h-[297mm]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── Header ── */}
      <div className="text-center mb-6">
        <h1 className="text-[32px] font-bold tracking-widest uppercase text-zinc-950 mb-1">{data.name}</h1>
        {data.headline && (
          <p className="text-sm text-zinc-500 tracking-wide mb-2">{data.headline}</p>
        )}
        {/* Contact row */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
          {data.email && <span>{data.email}</span>}
          {data.email && data.phone && <span className="text-zinc-300">|</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <><span className="text-zinc-300">|</span><span>{data.location}</span></>}
          {data.website && <><span className="text-zinc-300">|</span><span>{data.website.replace(/^https?:\/\//, "")}</span></>}
          {data.linkedinUrl && <><span className="text-zinc-300">|</span><span>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin/")}</span></>}
          {data.githubUrl && <><span className="text-zinc-300">|</span><span>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}</span></>}
        </div>
        <div className="mt-4 border-t-2 border-zinc-950" />
      </div>

      {/* ── Summary ── */}
      {data.bio && (
        <Section title="Summary">
          <p className="text-zinc-700 leading-relaxed">{data.bio}</p>
        </Section>
      )}

      {/* ── Experience ── */}
      {data.experiences.length > 0 && (
        <Section title="Professional Experience">
          <div className="space-y-5">
            {data.experiences.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-950 text-[13px]">{e.title}</span>
                    <span className="text-zinc-600"> — {e.company}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap ml-4 italic">
                    {e.startDate} – {e.endDate}
                  </span>
                </div>
                {e.location && <p className="text-[11px] text-zinc-400">{e.location}</p>}
                {e.description && (
                  <ul className="mt-1.5 space-y-0.5 ml-1">
                    {e.description.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="flex gap-2 text-zinc-700">
                        <span className="shrink-0 mt-0.5 text-zinc-400">•</span>
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

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((e) => (
              <div key={e.id} className="flex justify-between">
                <div>
                  <span className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</span>
                  <span className="text-zinc-600"> — {e.institution}</span>
                  {e.gpa && <span className="text-zinc-400 text-[11px]"> · GPA: {e.gpa}</span>}
                </div>
                <span className="text-[11px] text-zinc-500 whitespace-nowrap ml-4 italic">
                  {e.startDate} – {e.endDate}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Skills ── */}
      {allSkills.length > 0 && (
        <Section title="Skills & Technologies">
          <p className="text-zinc-700">{allSkills.join(" · ")}</p>
        </Section>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {data.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-zinc-950">{p.title}</span>
                  {p.technologies.length > 0 && (
                    <span className="text-[11px] text-zinc-400">({p.technologies.join(", ")})</span>
                  )}
                </div>
                {p.description && <p className="text-zinc-700 mt-0.5">{p.description}</p>}
                {(p.liveUrl || p.githubUrl) && (
                  <p className="text-[11px] text-zinc-400 mt-0.5">
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
        <Section title="Certifications">
          <div className="space-y-1.5">
            {data.certifications.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span>
                  <span className="font-semibold text-zinc-950">{c.name}</span>
                  <span className="text-zinc-600"> — {c.issuer}</span>
                </span>
                <span className="text-[11px] text-zinc-500 italic whitespace-nowrap ml-4">{c.issueDate}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-950 border-b border-zinc-300 pb-1 mb-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
