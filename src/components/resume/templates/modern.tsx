import Image from "next/image";
import type { ResumeData } from "../resume-viewer";

const TEAL = "#0D9488"; // teal-600

export function ModernTemplate({ data }: { data: ResumeData }) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white flex min-h-[297mm] text-[12.5px] leading-relaxed" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div className="w-[220px] shrink-0 flex flex-col" style={{ backgroundColor: TEAL, color: "#fff" }}>

        {/* Photo */}
        <div className="flex justify-center pt-8 pb-4">
          {data.avatarUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
              <Image src={data.avatarUrl} alt={data.name} width={96} height={96} className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10">
              <span className="text-2xl font-bold text-white/80">{data.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-6 pb-8 space-y-5">

          {/* Contact */}
          <SideSection title="CONTACT">
            <div className="space-y-1.5">
              {data.email && <ContactRow icon="✉" text={data.email} />}
              {data.phone && <ContactRow icon="☎" text={data.phone} />}
              {data.location && <ContactRow icon="◎" text={data.location} />}
              {data.website && <ContactRow icon="⊕" text={data.website.replace(/^https?:\/\//, "")} />}
              {data.linkedinUrl && (
                <ContactRow icon="in" text={data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")} />
              )}
              {data.githubUrl && (
                <ContactRow icon="gh" text={data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")} />
              )}
            </div>
          </SideSection>

          {/* Skills */}
          {allSkills.length > 0 && (
            <SideSection title="SKILLS">
              <div className="space-y-2">
                {allSkills.slice(0, 10).map((skill, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-white mb-0.5">{skill}</p>
                    <div className="h-1 bg-white/20 rounded-full">
                      <div
                        className="h-1 rounded-full bg-white"
                        style={{ width: `${100 - (i % 3) * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SideSection>
          )}

          {/* Extra skills as tags */}
          {allSkills.length > 10 && (
            <SideSection title="MORE SKILLS">
              <div className="flex flex-wrap gap-1">
                {allSkills.slice(10).map((s, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white">{s}</span>
                ))}
              </div>
            </SideSection>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <SideSection title="CERTIFICATIONS">
              <div className="space-y-2">
                {data.certifications.map((c) => (
                  <div key={c.id}>
                    <p className="text-[11px] font-semibold text-white leading-snug">{c.name}</p>
                    <p className="text-[10px] text-white/70">{c.issuer}</p>
                    <p className="text-[10px] text-white/50">{c.issueDate}</p>
                  </div>
                ))}
              </div>
            </SideSection>
          )}
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 px-8 py-8">

        {/* Name + headline */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-zinc-950 leading-tight">{data.name}</h1>
          {data.headline && (
            <p className="text-sm font-medium mt-0.5" style={{ color: TEAL }}>{data.headline}</p>
          )}
          {data.bio && (
            <p className="text-zinc-600 mt-3 text-[12px] leading-relaxed border-t border-zinc-100 pt-3">{data.bio}</p>
          )}
        </div>

        {/* Experience */}
        {data.experiences.length > 0 && (
          <MainSection title="WORK EXPERIENCE" color={TEAL}>
            <div className="space-y-5">
              {data.experiences.map((e) => (
                <div key={e.id}>
                  <p className="font-bold text-zinc-950" style={{ color: TEAL }}>{e.title}</p>
                  <p className="font-semibold text-zinc-700 text-[12px]">{e.company}</p>
                  <div className="flex justify-between text-[11px] text-zinc-400 italic mb-1">
                    <span>{e.startDate} – {e.endDate}</span>
                    {e.location && <span>{e.location}</span>}
                  </div>
                  {e.description && (
                    <ul className="space-y-0.5 mt-1">
                      {e.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex gap-2 text-zinc-600">
                          <span className="mt-1 shrink-0" style={{ color: TEAL }}>▪</span>
                          <span>{line.replace(/^[-•▪]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <MainSection title="EDUCATION" color={TEAL}>
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id}>
                  <p className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                  <p className="text-zinc-600 text-[12px]">{e.institution}</p>
                  <p className="text-zinc-400 italic text-[11px]">{e.startDate} – {e.endDate}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <MainSection title="PROJECTS" color={TEAL}>
            <div className="space-y-3">
              {data.projects.map((p) => (
                <div key={p.id}>
                  <p className="font-bold text-zinc-950">{p.title}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-[11px]" style={{ color: TEAL }}>{p.technologies.join(", ")}</p>
                  )}
                  {p.description && <p className="text-zinc-600 text-[12px] mt-0.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </MainSection>
        )}
      </div>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.2em] text-white/60 mb-1.5 uppercase">{title}</p>
      <div className="border-t border-white/20 pt-2">{children}</div>
    </div>
  );
}

function ContactRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/60 mt-0.5 w-4 shrink-0 text-center">{icon}</span>
      <span className="text-[10px] text-white/85 break-all">{text}</span>
    </div>
  );
}

function MainSection({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[10px] font-bold tracking-[0.15em]" style={{ color }}>{title}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: color }} />
      </div>
      {children}
    </div>
  );
}
