import type { ResumeData } from "../resume-viewer";

interface Props { data: ResumeData; accentColor: string; }

export function ClassicTemplate({ data, accentColor }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed px-12 py-10 min-h-[297mm]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── Header ── */}
      <div className="text-center mb-6">
        <h1 className="text-[32px] font-bold tracking-widest uppercase text-zinc-950 mb-1">{data.name}</h1>
        {data.headline && (
          <p className="text-sm tracking-wide mb-2" style={{ color: accentColor }}>{data.headline}</p>
        )}
        {/* Contact row */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
          {data.email    && <span>{data.email}</span>}
          {data.phone    && <><Pipe /><span>{data.phone}</span></>}
          {data.location && <><Pipe /><span>{data.location}</span></>}
          {data.website  && <><Pipe /><span>{data.website.replace(/^https?:\/\//, "")}</span></>}
          {data.linkedinUrl  && <><Pipe /><span>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin/")}</span></>}
          {data.githubUrl    && <><Pipe /><span>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}</span></>}
          {data.twitterUrl   && <><Pipe /><span>{data.twitterUrl.replace(/^https?:\/\/(www\.)?twitter\.com\//, "@").replace(/^https?:\/\/(www\.)?x\.com\//, "@")}</span></>}
          {data.instagramUrl && <><Pipe /><span>{data.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "ig/")}</span></>}
        </div>
        <div className="mt-4 border-t-2 border-zinc-950" />
      </div>

      {/* ── About / Summary ── */}
      {data.bio && (
        <Section title="About Me" accentColor={accentColor}>
          <p className="text-zinc-700 leading-relaxed">{data.bio}</p>
        </Section>
      )}

      {/* ── Experience ── */}
      {data.experiences.length > 0 && (
        <Section title="Work Experience" accentColor={accentColor}>
          <div className="space-y-5">
            {data.experiences.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-950 text-[13px]">{e.title}</span>
                    <span className="text-zinc-600"> — {e.company}</span>
                    {e.location && <span className="text-zinc-400 text-[11px]"> · {e.location}</span>}
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap ml-4 italic">
                    {e.startDate} – {e.endDate}
                  </span>
                </div>
                {e.description && (
                  <ul className="mt-1.5 space-y-0.5 ml-1">
                    {e.description.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="flex gap-2 text-zinc-700">
                        <span className="shrink-0 mt-1" style={{ color: accentColor }}>•</span>
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

      {/* ── Skills ── */}
      {allSkills.length > 0 && (
        <Section title="Skills & Technologies" accentColor={accentColor}>
          <div className="flex flex-wrap gap-x-1 gap-y-1">
            {allSkills.map((s, i) => (
              <span key={i}>
                <span className="text-zinc-700">{s}</span>
                {i < allSkills.length - 1 && <span className="text-zinc-300 mx-1">·</span>}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <Section title="Projects" accentColor={accentColor}>
          <div className="space-y-4">
            {data.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-zinc-950">{p.title}</span>
                  {p.technologies.length > 0 && (
                    <span className="text-[11px]" style={{ color: accentColor }}>
                      {p.technologies.join(", ")}
                    </span>
                  )}
                </div>
                {p.description && <p className="text-zinc-700 mt-0.5 leading-relaxed">{p.description}</p>}
                {(p.liveUrl || p.githubUrl) && (
                  <p className="text-[11px] mt-0.5" style={{ color: accentColor }}>
                    {(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}
                  </p>
                )}
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

      {/* ── Certifications ── */}
      {data.certifications.length > 0 && (
        <Section title="Certifications" accentColor={accentColor}>
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

      {/* ── Extras (grouped by category) ── */}
      {data.extras.length > 0 && (
        <>
          {Array.from(new Set(data.extras.map((x) => x.category))).map((cat) => (
            <Section key={cat} title={cat} accentColor={accentColor}>
              <div className="space-y-2">
                {data.extras.filter((x) => x.category === cat).map((x) => (
                  <div key={x.id}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-zinc-950">{x.title}</span>
                        {x.subtitle && <span className="text-zinc-500"> — {x.subtitle}</span>}
                      </div>
                      {x.date && <span className="text-[11px] text-zinc-400 italic whitespace-nowrap ml-4">{x.date}</span>}
                    </div>
                    {x.description && <p className="text-zinc-600 mt-0.5">{x.description}</p>}
                    {x.url && <p className="text-[11px] mt-0.5" style={{ color: accentColor }}>{x.url.replace(/^https?:\/\//, "")}</p>}
                  </div>
                ))}
              </div>
            </Section>
          ))}
        </>
      )}
    </div>
  );
}

function Pipe() {
  return <span className="text-zinc-300">|</span>;
}

function Section({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] pb-1 mb-2.5 border-b"
        style={{ color: accentColor, borderColor: accentColor }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
