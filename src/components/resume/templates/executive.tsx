import type { ResumeData } from "../resume-viewer";

interface Props { data: ResumeData; accentColor: string; }

export function ExecutiveTemplate({ data, accentColor }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  // Derive a very light tint for skill chips
  const chipBg = accentColor + "18"; // 10% opacity hex trick

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed min-h-[297mm]"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="px-12 pt-10 pb-7" style={{ borderBottom: `3px solid ${accentColor}` }}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-[38px] font-light tracking-tight text-zinc-950 leading-none">{data.name}</h1>
            {data.headline && (
              <p className="text-sm font-semibold mt-1 tracking-wide" style={{ color: accentColor }}>{data.headline}</p>
            )}
          </div>
          {/* Contact block */}
          <div className="text-right text-[11px] text-zinc-500 space-y-0.5 shrink-0">
            {data.email       && <p>{data.email}</p>}
            {data.phone       && <p>{data.phone}</p>}
            {data.location    && <p>{data.location}</p>}
            {data.website     && <p>{data.website.replace(/^https?:\/\//, "")}</p>}
            {data.linkedinUrl  && <p>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</p>}
            {data.githubUrl    && <p>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}</p>}
            {data.twitterUrl   && <p>{data.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "@")}</p>}
            {data.instagramUrl && <p>{data.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "ig/")}</p>}
          </div>
        </div>
        {data.bio && (
          <p className="text-zinc-600 mt-4 leading-relaxed text-[12px]">{data.bio}</p>
        )}
      </div>

      <div className="px-12 py-8 space-y-6">

        {/* ── Skills ── */}
        {allSkills.length > 0 && (
          <Section title="Core Skills" accentColor={accentColor}>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 text-[11px] rounded border font-medium"
                  style={{ borderColor: accentColor + "55", backgroundColor: chipBg, color: accentColor }}>
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Experience ── */}
        {data.experiences.length > 0 && (
          <Section title="Professional Experience" accentColor={accentColor}>
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
                          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: accentColor }} />
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

        {/* ── Projects — full width ── */}
        {data.projects.length > 0 && (
          <Section title="Projects" accentColor={accentColor}>
            <div className="space-y-4">
              {data.projects.map((p) => (
                <div key={p.id} className="pl-4" style={{ borderLeft: `3px solid ${accentColor}` }}>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <p className="font-bold text-zinc-950">{p.title}</p>
                    {p.technologies.length > 0 && (
                      <span className="text-[11px]" style={{ color: accentColor }}>{p.technologies.join(", ")}</span>
                    )}
                    {(p.liveUrl || p.githubUrl) && (
                      <span className="text-[11px] text-zinc-400">
                        {(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {p.description && <p className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed">{p.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        {data.education.length > 0 && (
          <Section title="Education" accentColor={accentColor}>
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id} className="flex justify-between">
                  <div>
                    <p className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                    <p className="text-zinc-500 text-[12px]">{e.institution}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                  </div>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-6 tabular-nums">
                    {e.startDate} – {e.endDate}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications ── */}
        {data.certifications.length > 0 && (
          <Section title="Certifications" accentColor={accentColor}>
            <div className="space-y-1.5">
              {data.certifications.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span>
                    <span className="font-semibold text-zinc-950">{c.name}</span>
                    <span className="text-zinc-500 text-[12px]"> — {c.issuer}</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4">{c.issueDate}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Extras grouped by category */}
        {data.extras.length > 0 && Array.from(new Set(data.extras.map((x) => x.category))).map((cat) => (
          <Section key={cat} title={cat} accentColor={accentColor}>
            <div className="space-y-3">
              {data.extras.filter((x) => x.category === cat).map((x) => (
                <div key={x.id} className="pl-4" style={{ borderLeft: `3px solid ${accentColor}` }}>
                  <div className="flex justify-between items-baseline flex-wrap gap-2">
                    <p className="font-bold text-zinc-950">{x.title}</p>
                    {x.date && <span className="text-[11px] text-zinc-400 tabular-nums">{x.date}</span>}
                  </div>
                  {x.subtitle && <p className="text-zinc-500 text-[12px]">{x.subtitle}</p>}
                  {x.description && <p className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed">{x.description}</p>}
                  {x.url && <p className="text-[11px] mt-0.5" style={{ color: accentColor }}>{x.url.replace(/^https?:\/\//, "")}</p>}
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] shrink-0" style={{ color: accentColor }}>{title}</h2>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>
      {children}
    </div>
  );
}
