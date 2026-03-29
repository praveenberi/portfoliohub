import type { ResumeData } from "../resume-viewer";

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-zinc-900 text-[13px] leading-relaxed px-16 py-12 min-h-[297mm]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-zinc-950 mb-1">{data.name}</h1>
            <div className="h-0.5 w-16 bg-green-500 mb-2" />
            {data.headline && <p className="text-sm text-zinc-500 font-medium">{data.headline}</p>}
          </div>
          <div className="text-right text-xs text-zinc-500 space-y-0.5">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.website && <p>{data.website.replace(/^https?:\/\//, "")}</p>}
            {data.linkedinUrl && <p>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</p>}
            {data.githubUrl && <p>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}</p>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.bio && (
        <Section title="Professional Summary">
          <p className="text-zinc-600 leading-relaxed">{data.bio}</p>
        </Section>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <Section title="Professional Experience">
          <div className="space-y-6">
            {data.experiences.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <div>
                    <span className="font-semibold text-zinc-950 text-sm">{e.title}</span>
                    <span className="text-zinc-500 text-xs"> · {e.company}</span>
                    {e.location && <span className="text-zinc-400 text-xs"> · {e.location}</span>}
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-4 tabular-nums">{e.startDate} – {e.endDate}</span>
                </div>
                {e.description && (
                  <ul className="mt-1.5 space-y-1 ml-4">
                    {e.description.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="text-zinc-600 flex gap-2">
                        <span className="text-green-500 shrink-0 mt-0.5">–</span>
                        <span>{line.replace(/^[-•–]\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Two-column: Education + Skills */}
      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && (
          <Section title="Education">
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id}>
                  <p className="font-semibold text-zinc-950 text-sm">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                  <p className="text-zinc-500 text-xs">{e.institution}</p>
                  <p className="text-zinc-400 text-xs">{e.startDate} – {e.endDate}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {allSkills.length > 0 && (
          <Section title="Core Competencies">
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 border border-zinc-200 text-zinc-600 text-[11px] rounded-sm">{s}</span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <Section title="Notable Projects">
          <div className="grid grid-cols-2 gap-4">
            {data.projects.map((p) => (
              <div key={p.id} className="border-l-2 border-green-500 pl-3">
                <p className="font-semibold text-zinc-950 text-sm">{p.title}</p>
                {p.technologies.length > 0 && (
                  <p className="text-[11px] text-zinc-400 mb-0.5">{p.technologies.join(", ")}</p>
                )}
                {p.description && <p className="text-xs text-zinc-600">{p.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {data.certifications.map((c) => (
              <div key={c.id}>
                <span className="font-semibold text-zinc-950 text-sm">{c.name}</span>
                <span className="text-zinc-400 text-xs"> · {c.issuer} · {c.issueDate}</span>
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
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{title}</h2>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>
      {children}
    </div>
  );
}
