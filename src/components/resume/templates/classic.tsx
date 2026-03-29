import type { ResumeData } from "../resume-viewer";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-zinc-900 font-sans text-[13px] leading-relaxed p-12 min-h-[297mm]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-wide uppercase text-zinc-950 mb-1">{data.name}</h1>
        {data.headline && <p className="text-sm text-zinc-600 mb-2">{data.headline}</p>}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-xs text-zinc-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.website && <span>{data.website.replace(/^https?:\/\//, "")}</span>}
          {data.linkedinUrl && <span>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</span>}
          {data.githubUrl && <span>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}</span>}
        </div>
      </div>

      <hr className="border-zinc-900 mb-4" />

      {/* Summary */}
      {data.bio && (
        <Section title="Summary">
          <p className="text-zinc-700">{data.bio}</p>
        </Section>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {data.experiences.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-950">{e.title}</span>
                    <span className="text-zinc-600"> — {e.company}</span>
                    {e.location && <span className="text-zinc-500 text-xs"> · {e.location}</span>}
                  </div>
                  <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">{e.startDate} – {e.endDate}</span>
                </div>
                {e.description && (
                  <ul className="mt-1 space-y-0.5">
                    {e.description.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="text-zinc-700 before:content-['•'] before:mr-2 before:text-zinc-400 flex">
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

      {/* Education */}
      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((e) => (
              <div key={e.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</span>
                  <span className="text-zinc-600"> — {e.institution}</span>
                  {e.gpa && <span className="text-zinc-500 text-xs"> · GPA: {e.gpa}</span>}
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">{e.startDate} – {e.endDate}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <Section title="Skills">
          <p className="text-zinc-700">{allSkills.join(" · ")}</p>
        </Section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {data.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-zinc-950">{p.title}</span>
                  {p.technologies.length > 0 && (
                    <span className="text-xs text-zinc-500">({p.technologies.join(", ")})</span>
                  )}
                  {(p.liveUrl || p.githubUrl) && (
                    <span className="text-xs text-zinc-500">{(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}</span>
                  )}
                </div>
                {p.description && <p className="text-zinc-700 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-1">
            {data.certifications.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span className="text-zinc-700"><span className="font-semibold">{c.name}</span> — {c.issuer}</span>
                <span className="text-xs text-zinc-500">{c.issueDate}</span>
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
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-1 mb-2">{title}</h2>
      {children}
    </div>
  );
}
