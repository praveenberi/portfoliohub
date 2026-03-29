import type { ResumeData } from "../resume-viewer";

export function ModernTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white text-[13px] leading-relaxed flex min-h-[297mm]" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 bg-zinc-950 text-white p-8 flex flex-col gap-6">
        {/* Name */}
        <div>
          <h1 className="text-xl font-bold leading-tight text-white">{data.name}</h1>
          {data.headline && <p className="text-xs text-green-400 mt-1 leading-snug">{data.headline}</p>}
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <SideLabel>Contact</SideLabel>
          {data.email && <SideItem>{data.email}</SideItem>}
          {data.phone && <SideItem>{data.phone}</SideItem>}
          {data.location && <SideItem>{data.location}</SideItem>}
          {data.website && <SideItem>{data.website.replace(/^https?:\/\//, "")}</SideItem>}
          {data.linkedinUrl && <SideItem>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}</SideItem>}
          {data.githubUrl && <SideItem>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "gh/")}</SideItem>}
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <div>
            <SideLabel>Skills</SideLabel>
            <div className="flex flex-wrap gap-1 mt-2">
              {allSkills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/10 text-white text-[10px] rounded">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <SideLabel>Certifications</SideLabel>
            <div className="space-y-2 mt-2">
              {data.certifications.map((c) => (
                <div key={c.id}>
                  <p className="text-[11px] text-white font-semibold leading-snug">{c.name}</p>
                  <p className="text-[10px] text-zinc-400">{c.issuer} · {c.issueDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 space-y-6">
        {/* Summary */}
        {data.bio && (
          <MainSection title="About">
            <p className="text-zinc-600">{data.bio}</p>
          </MainSection>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <MainSection title="Experience">
            <div className="space-y-5">
              {data.experiences.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between items-start mb-0.5">
                    <div>
                      <p className="font-bold text-zinc-950">{e.title}</p>
                      <p className="text-zinc-500 text-xs">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4 mt-0.5">{e.startDate} – {e.endDate}</span>
                  </div>
                  {e.description && (
                    <div className="mt-1.5 space-y-0.5">
                      {e.description.split("\n").filter(Boolean).map((line, i) => (
                        <div key={i} className="flex gap-2 text-zinc-600">
                          <span className="text-green-500 mt-0.5 shrink-0">▸</span>
                          <span>{line.replace(/^[-•▸]\s*/, "")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <MainSection title="Education">
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id} className="flex justify-between">
                  <div>
                    <p className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                    <p className="text-zinc-500 text-xs">{e.institution}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                  </div>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4">{e.startDate} – {e.endDate}</span>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <MainSection title="Projects">
            <div className="space-y-3">
              {data.projects.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-zinc-950">{p.title}</p>
                    {p.technologies.length > 0 && (
                      <span className="text-[10px] text-zinc-400">{p.technologies.join(", ")}</span>
                    )}
                  </div>
                  {p.description && <p className="text-zinc-600 mt-0.5">{p.description}</p>}
                  {(p.liveUrl || p.githubUrl) && (
                    <p className="text-[11px] text-green-600 mt-0.5">{(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}</p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}
      </div>
    </div>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">{children}</p>;
}
function SideItem({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-zinc-300 break-all">{children}</p>;
}
function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">{title}</h2>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>
      {children}
    </div>
  );
}
