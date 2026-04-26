import Image from "next/image";
import type { ResumeData, ResumeEditing } from "../resume-viewer";
import { groupSkills } from "@/lib/utils";
import { Editable, SkillsEditor } from "../editable";

interface Props { data: ResumeData; accentColor: string; editing?: ResumeEditing; }

export function ModernTemplate({ data, accentColor, editing }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);
  const skillGroups = groupSkills(allSkills);
  const ed = editing?.editable ?? false;
  const ek = ed ? "edit" : "view";

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

          {/* Skills — grouped */}
          {(allSkills.length > 0 || ed) && (
            <SideSection title="SKILLS">
              <SkillsEditor
                skills={allSkills}
                editable={ed}
                textClassName="text-[10px] text-zinc-800 bg-white"
                onChange={(next) => {
                  editing?.updateField("skills", next);
                  editing?.updateField("technologies", []);
                }}
              >
                <div className="space-y-2.5">
                  {skillGroups.map((g, i) => (
                    <div key={i}>
                      {g.label && (
                        <p className="text-[9px] font-bold tracking-wider text-white/70 uppercase mb-1">
                          {g.label}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {g.items.map((skill, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium break-words max-w-full leading-snug">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SkillsEditor>
            </SideSection>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <SideSection title="CERTIFICATIONS">
              <div className="space-y-2">
                {data.certifications.map((c) => (
                  <div key={c.id}>
                    <Editable as="p" className="text-[11px] font-semibold text-white leading-snug"
                      value={c.name} editable={ed} editKey={`${ek}-cert-name-${c.id}`}
                      onChange={(v) => editing?.updateCertification(c.id, { name: v })} />
                    <Editable as="p" className="text-[10px] text-white/70"
                      value={c.issuer} editable={ed} editKey={`${ek}-cert-issuer-${c.id}`}
                      onChange={(v) => editing?.updateCertification(c.id, { issuer: v })} />
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
          <Editable as="h1" className="text-3xl font-bold text-zinc-950 leading-tight inline-block"
            value={data.name} editable={ed} editKey={`${ek}-name`}
            onChange={(v) => editing?.updateField("name", v)} />
          {(data.headline || ed) && (
            <Editable as="p" className="text-sm font-semibold mt-0.5 inline-block" style={{ color: accentColor }}
              value={data.headline} editable={ed} editKey={`${ek}-headline`} placeholder="Add a headline"
              onChange={(v) => editing?.updateField("headline", v)} />
          )}
        </div>

        {/* About Me */}
        {(data.bio || ed) && (
          <MainSection title="ABOUT ME" color={accentColor}>
            <Editable as="p" multiline className="text-zinc-600 leading-relaxed whitespace-pre-wrap"
              value={data.bio} editable={ed} editKey={`${ek}-bio`} placeholder="Add a short professional summary"
              onChange={(v) => editing?.updateField("bio", v)} />
          </MainSection>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <MainSection title="WORK EXPERIENCE" color={accentColor}>
            <div className="space-y-5">
              {data.experiences.map((e) => (
                <div key={e.id}>
                  <Editable as="p" className="font-bold text-[13px]" style={{ color: accentColor }}
                    value={e.title} editable={ed} editKey={`${ek}-exp-title-${e.id}`}
                    onChange={(v) => editing?.updateExperience(e.id, { title: v })} />
                  <Editable as="p" className="font-semibold text-zinc-700 text-[12px]"
                    value={e.company} editable={ed} editKey={`${ek}-exp-co-${e.id}`}
                    onChange={(v) => editing?.updateExperience(e.id, { company: v })} />
                  <div className="flex justify-between text-[11px] text-zinc-400 italic mb-1">
                    <span>{e.startDate} – {e.endDate}</span>
                    {(e.location || ed) && (
                      <Editable value={e.location} editable={ed} editKey={`${ek}-exp-loc-${e.id}`} placeholder="location"
                        onChange={(v) => editing?.updateExperience(e.id, { location: v })} />
                    )}
                  </div>
                  {(e.description || ed) && (
                    ed ? (
                      <Editable as="div" multiline className="text-zinc-600 text-[12px] whitespace-pre-wrap mt-1"
                        value={e.description} editable={ed} editKey={`${ek}-exp-desc-${e.id}`} placeholder="One bullet per line"
                        onChange={(v) => editing?.updateExperience(e.id, { description: v })} />
                    ) : (
                      <ul className="space-y-0.5 mt-1">
                        {e.description.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex gap-2 text-zinc-600">
                            <span className="mt-1 shrink-0" style={{ color: accentColor }}>▪</span>
                            <span>{line.replace(/^[-•▪]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    )
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
                    <Editable as="p" className="font-bold text-zinc-950" value={p.title} editable={ed} editKey={`${ek}-proj-title-${p.id}`}
                      onChange={(v) => editing?.updateProject(p.id, { title: v })} />
                    {p.technologies.length > 0 && (
                      <span className="text-[11px]" style={{ color: accentColor }}>{p.technologies.join(", ")}</span>
                    )}
                  </div>
                  {(p.description || ed) && (
                    <Editable as="p" multiline className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed whitespace-pre-wrap"
                      value={p.description} editable={ed} editKey={`${ek}-proj-desc-${p.id}`} placeholder="Describe the project"
                      onChange={(v) => editing?.updateProject(p.id, { description: v })} />
                  )}
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
                    <p className="font-bold text-zinc-950">
                      <Editable value={e.degree} editable={ed} editKey={`${ek}-edu-deg-${e.id}`}
                        onChange={(v) => editing?.updateEducation(e.id, { degree: v })} />
                      {(e.field || ed) && (<>
                        <span> in </span>
                        <Editable value={e.field} editable={ed} editKey={`${ek}-edu-field-${e.id}`} placeholder="field"
                          onChange={(v) => editing?.updateEducation(e.id, { field: v })} />
                      </>)}
                    </p>
                    <span className="text-[11px] text-zinc-400 italic whitespace-nowrap ml-4">{e.startDate} – {e.endDate}</span>
                  </div>
                  <p className="text-zinc-500 text-[12px]">
                    <Editable value={e.institution} editable={ed} editKey={`${ek}-edu-inst-${e.id}`}
                      onChange={(v) => editing?.updateEducation(e.id, { institution: v })} />
                    {(e.gpa || ed) && (<>
                      <span> · GPA </span>
                      <Editable value={e.gpa} editable={ed} editKey={`${ek}-edu-gpa-${e.id}`} placeholder="—"
                        onChange={(v) => editing?.updateEducation(e.id, { gpa: v })} />
                    </>)}
                  </p>
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
