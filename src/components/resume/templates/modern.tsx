import Image from "next/image";
import type { ResumeData } from "../resume-viewer";

interface Props { data: ResumeData; accentColor: string; }

export function ModernTemplate({ data, accentColor }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);

  return (
    <div className="bg-white flex min-h-[297mm] text-[12.5px] leading-relaxed"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Sidebar ────────────────────────── */}
      <div className="w-[220px] shrink-0 flex flex-col" style={{ backgroundColor: accentColor, color: "#fff" }}>

        {/* Photo */}
        <div className="flex justify-center pt-8 pb-4">
          {data.avatarUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
              <Image src={data.avatarUrl} alt={data.name} width={96} height={96} className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10">
              <span className="text-3xl font-bold text-white/80">{data.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-6 pb-8 space-y-5">

          {/* Contact */}
          <SideSection title="CONTACT">
            <div className="space-y-1.5">
              {data.email       && <ContactRow icon="✉" text={data.email} />}
              {data.phone       && <ContactRow icon="☎" text={data.phone} />}
              {data.location    && <ContactRow icon="◎" text={data.location} />}
              {data.website     && <ContactRow icon="⊕" text={data.website.replace(/^https?:\/\//, "")} />}
              {data.linkedinUrl  && <ContactRow icon="in" text={data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")} />}
              {data.githubUrl    && <ContactRow icon="gh" text={data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")} />}
              {data.twitterUrl   && <ContactRow icon="𝕏"  text={data.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "@")} />}
              {data.instagramUrl && <ContactRow icon="ig" text={data.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "ig/")} />}
            </div>
          </SideSection>

          {/* Skills */}
          {allSkills.length > 0 && (
            <SideSection title="SKILLS">
              <div className="flex flex-wrap gap-1">
                {allSkills.map((skill, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">
                    {skill}
                  </span>
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

      {/* ── Main ───────────────────────────── */}
      <div className="flex-1 px-8 py-8">

        {/* Name + headline */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-zinc-950 leading-tight">{data.name}</h1>
          {data.headline && (
            <p className="text-sm font-semibold mt-0.5" style={{ color: accentColor }}>{data.headline}</p>
          )}
        </div>

        {/* About Me */}
        {data.bio && (
          <MainSection title="ABOUT ME" color={accentColor}>
            <p className="text-zinc-600 leading-relaxed">{data.bio}</p>
          </MainSection>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <MainSection title="WORK EXPERIENCE" color={accentColor}>
            <div className="space-y-5">
              {data.experiences.map((e) => (
                <div key={e.id}>
                  <p className="font-bold text-[13px]" style={{ color: accentColor }}>{e.title}</p>
                  <p className="font-semibold text-zinc-700 text-[12px]">{e.company}</p>
                  <div className="flex justify-between text-[11px] text-zinc-400 italic mb-1">
                    <span>{e.startDate} – {e.endDate}</span>
                    {e.location && <span>{e.location}</span>}
                  </div>
                  {e.description && (
                    <ul className="space-y-0.5 mt-1">
                      {e.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex gap-2 text-zinc-600">
                          <span className="mt-1 shrink-0" style={{ color: accentColor }}>▪</span>
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

        {/* Projects — full width */}
        {data.projects.length > 0 && (
          <MainSection title="PROJECTS" color={accentColor}>
            <div className="space-y-4">
              {data.projects.map((p) => (
                <div key={p.id}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-bold text-zinc-950">{p.title}</p>
                    {p.technologies.length > 0 && (
                      <span className="text-[11px]" style={{ color: accentColor }}>{p.technologies.join(", ")}</span>
                    )}
                  </div>
                  {p.description && <p className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed">{p.description}</p>}
                  {(p.liveUrl || p.githubUrl) && (
                    <p className="text-[11px] mt-0.5" style={{ color: accentColor }}>
                      {(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <MainSection title="EDUCATION" color={accentColor}>
            <div className="space-y-3">
              {data.education.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between">
                    <p className="font-bold text-zinc-950">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                    <span className="text-[11px] text-zinc-400 italic whitespace-nowrap ml-4">{e.startDate} – {e.endDate}</span>
                  </div>
                  <p className="text-zinc-500 text-[12px]">{e.institution}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Extras grouped by category */}
        {data.extras.length > 0 && Array.from(new Set(data.extras.map((x) => x.category))).map((cat) => (
          <MainSection key={cat} title={cat.toUpperCase()} color={accentColor}>
            <div className="space-y-3">
              {data.extras.filter((x) => x.category === cat).map((x) => (
                <div key={x.id}>
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <p className="font-bold text-zinc-950">{x.title}</p>
                    {x.date && <span className="text-[11px] text-zinc-400 italic">{x.date}</span>}
                  </div>
                  {x.subtitle && <p className="text-zinc-500 text-[12px]">{x.subtitle}</p>}
                  {x.description && <p className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed">{x.description}</p>}
                  {x.url && <p className="text-[11px] mt-0.5" style={{ color: accentColor }}>{x.url.replace(/^https?:\/\//, "")}</p>}
                </div>
              ))}
            </div>
          </MainSection>
        ))}
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
