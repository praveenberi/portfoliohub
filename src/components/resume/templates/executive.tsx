import type { ResumeData, ResumeEditing } from "../resume-viewer";
import { groupSkills } from "@/lib/utils";
import { Editable, SkillsEditor } from "../editable";

interface Props { data: ResumeData; accentColor: string; editing?: ResumeEditing; }

export function ExecutiveTemplate({ data, accentColor, editing }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);
  const skillGroups = groupSkills(allSkills);
  const ed = editing?.editable ?? false;
  const ek = ed ? "edit" : "view";

  // Derive a very light tint for skill chips
  const chipBg = accentColor + "18"; // 10% opacity hex trick

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed min-h-[297mm]"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="px-12 pt-10 pb-7" style={{ borderBottom: `3px solid ${accentColor}` }}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <Editable as="h1" className="text-[38px] font-light tracking-tight text-zinc-950 leading-none inline-block"
              value={data.name} editable={ed} editKey={`${ek}-name`}
              onChange={(v) => editing?.updateField("name", v)} />
            {(data.headline || ed) && (
              <Editable as="p" className="text-sm font-semibold mt-1 tracking-wide inline-block"
                style={{ color: accentColor }}
                value={data.headline} editable={ed} editKey={`${ek}-headline`} placeholder="Add a headline"
                onChange={(v) => editing?.updateField("headline", v)} />
            )}
          </div>
          {/* Contact block */}
          <div className="text-right text-[11px] text-zinc-500 space-y-0.5 shrink-0">
            {(data.email || ed) && (
              <Editable as="p" value={data.email} editable={ed} editKey={`${ek}-email`} placeholder="email"
                onChange={(v) => editing?.updateField("email", v)} />
            )}
            {(data.phone || ed) && (
              <Editable as="p" value={data.phone} editable={ed} editKey={`${ek}-phone`} placeholder="phone"
                onChange={(v) => editing?.updateField("phone", v)} />
            )}
            {(data.location || ed) && (
              <Editable as="p" value={data.location} editable={ed} editKey={`${ek}-loc`} placeholder="location"
                onChange={(v) => editing?.updateField("location", v)} />
            )}
            {data.website     && <p>{data.website.replace(/^https?:\/\//, "")}</p>}
            {data.linkedinUrl  && <p>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</p>}
            {data.githubUrl    && <p>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")}</p>}
            {data.twitterUrl   && <p>{data.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "@")}</p>}
            {data.instagramUrl && <p>{data.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "ig/")}</p>}
          </div>
        </div>
      </div>

      <div className="px-12 py-8 space-y-6">

        {/* ── About Me ── */}
        {(data.bio || ed) && (
          <Section title="About Me" accentColor={accentColor}>
            <Editable as="p" multiline className="text-zinc-600 leading-relaxed text-[12px] whitespace-pre-wrap"
              value={data.bio} editable={ed} editKey={`${ek}-bio`} placeholder="Add a short professional summary"
              onChange={(v) => editing?.updateField("bio", v)} />
          </Section>
        )}

        {/* ── Skills — grouped ── */}
        {(allSkills.length > 0 || ed) && (
          <Section title="Core Skills" accentColor={accentColor}>
            <SkillsEditor
              skills={allSkills}
              editable={ed}
              textClassName="text-[12px] text-zinc-800"
              onChange={(next) => {
                editing?.updateField("skills", next);
                editing?.updateField("technologies", []);
              }}
            >
              <div className="space-y-2">
                {skillGroups.map((g, gi) => (
                  <div key={gi} className="flex items-baseline gap-3">
                    {g.label && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] shrink-0 min-w-[110px]"
                        style={{ color: accentColor }}>
                        {g.label}
                      </span>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 text-[11px] rounded border font-medium break-words max-w-full"
                          style={{ borderColor: accentColor + "55", backgroundColor: chipBg, color: accentColor }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SkillsEditor>
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
                      <Editable as="p" className="font-bold text-zinc-950 text-[13px]"
                        value={e.title} editable={ed} editKey={`${ek}-exp-title-${e.id}`}
                        onChange={(v) => editing?.updateExperience(e.id, { title: v })} />
                      <p className="text-zinc-500 text-[12px]">
                        <Editable value={e.company} editable={ed} editKey={`${ek}-exp-co-${e.id}`}
                          onChange={(v) => editing?.updateExperience(e.id, { company: v })} />
                        {(e.location || ed) && (<>
                          <span> · </span>
                          <Editable value={e.location} editable={ed} editKey={`${ek}-exp-loc-${e.id}`} placeholder="location"
                            onChange={(v) => editing?.updateExperience(e.id, { location: v })} />
                        </>)}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-6 tabular-nums pt-0.5">
                      {e.startDate} – {e.endDate}
                    </span>
                  </div>
                  {(e.description || ed) && (
                    ed ? (
                      <Editable as="div" multiline className="mt-2 text-zinc-600 whitespace-pre-wrap"
                        value={e.description} editable={ed} editKey={`${ek}-exp-desc-${e.id}`} placeholder="One bullet per line"
                        onChange={(v) => editing?.updateExperience(e.id, { description: v })} />
                    ) : (
                      <ul className="mt-2 space-y-1 ml-3">
                        {e.description.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex gap-2 text-zinc-600">
                            <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: accentColor }} />
                            <span>{line.replace(/^[-•]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    )
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
                    <Editable as="p" className="font-bold text-zinc-950"
                      value={p.title} editable={ed} editKey={`${ek}-proj-title-${p.id}`}
                      onChange={(v) => editing?.updateProject(p.id, { title: v })} />
                    {p.technologies.length > 0 && (
                      <span className="text-[11px]" style={{ color: accentColor }}>{p.technologies.join(", ")}</span>
                    )}
                    {(p.liveUrl || p.githubUrl) && (
                      <span className="text-[11px] text-zinc-400">
                        {(p.liveUrl || p.githubUrl || "").replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {(p.description || ed) && (
                    <Editable as="p" multiline className="text-zinc-600 text-[12px] mt-0.5 leading-relaxed whitespace-pre-wrap"
                      value={p.description} editable={ed} editKey={`${ek}-proj-desc-${p.id}`} placeholder="Describe the project"
                      onChange={(v) => editing?.updateProject(p.id, { description: v })} />
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
                    <p className="font-bold text-zinc-950">
                      <Editable value={e.degree} editable={ed} editKey={`${ek}-edu-deg-${e.id}`}
                        onChange={(v) => editing?.updateEducation(e.id, { degree: v })} />
                      {(e.field || ed) && (<>
                        <span> in </span>
                        <Editable value={e.field} editable={ed} editKey={`${ek}-edu-field-${e.id}`} placeholder="field"
                          onChange={(v) => editing?.updateEducation(e.id, { field: v })} />
                      </>)}
                    </p>
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
                    <Editable className="font-semibold text-zinc-950"
                      value={c.name} editable={ed} editKey={`${ek}-cert-name-${c.id}`}
                      onChange={(v) => editing?.updateCertification(c.id, { name: v })} />
                    <span className="text-zinc-500 text-[12px]"> — </span>
                    <Editable className="text-zinc-500 text-[12px]"
                      value={c.issuer} editable={ed} editKey={`${ek}-cert-issuer-${c.id}`}
                      onChange={(v) => editing?.updateCertification(c.id, { issuer: v })} />
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
