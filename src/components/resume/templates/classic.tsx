import type { ResumeData, ResumeEditing } from "../resume-viewer";
import { groupSkills } from "@/lib/utils";
import { Editable, SkillsEditor } from "../editable";

interface Props { data: ResumeData; accentColor: string; editing?: ResumeEditing; }

export function ClassicTemplate({ data, accentColor, editing }: Props) {
  const allSkills = Array.from(new Set([...data.skills, ...data.technologies])).filter(Boolean);
  const skillGroups = groupSkills(allSkills);
  const ed = editing?.editable ?? false;
  const ek = ed ? "edit" : "view";

  return (
    <div className="bg-white text-zinc-900 text-[12.5px] leading-relaxed px-12 py-10 min-h-[297mm]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── Header ── */}
      <div className="text-center mb-6">
        <Editable as="h1" className="text-[32px] font-bold tracking-widest uppercase text-zinc-950 mb-1 inline-block"
          value={data.name} editable={ed} editKey={`${ek}-name`}
          onChange={(v) => editing?.updateField("name", v)} />
        {(data.headline || ed) && (
          <Editable as="p" className="text-sm tracking-wide mb-2 inline-block" style={{ color: accentColor }}
            value={data.headline} editable={ed} editKey={`${ek}-headline`} placeholder="Add a headline"
            onChange={(v) => editing?.updateField("headline", v)} />
        )}
        {/* Contact row */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
          {(data.email || ed) && (
            <Editable value={data.email} editable={ed} editKey={`${ek}-email`} placeholder="email"
              onChange={(v) => editing?.updateField("email", v)} />
          )}
          {(data.phone || ed) && (<><Pipe />
            <Editable value={data.phone} editable={ed} editKey={`${ek}-phone`} placeholder="phone"
              onChange={(v) => editing?.updateField("phone", v)} />
          </>)}
          {(data.location || ed) && (<><Pipe />
            <Editable value={data.location} editable={ed} editKey={`${ek}-loc`} placeholder="location"
              onChange={(v) => editing?.updateField("location", v)} />
          </>)}
          {data.website  && <><Pipe /><span>{data.website.replace(/^https?:\/\//, "")}</span></>}
          {data.linkedinUrl  && <><Pipe /><span>{data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin/")}</span></>}
          {data.githubUrl    && <><Pipe /><span>{data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}</span></>}
          {data.twitterUrl   && <><Pipe /><span>{data.twitterUrl.replace(/^https?:\/\/(www\.)?twitter\.com\//, "@").replace(/^https?:\/\/(www\.)?x\.com\//, "@")}</span></>}
          {data.instagramUrl && <><Pipe /><span>{data.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "ig/")}</span></>}
        </div>
        <div className="mt-4 border-t-2 border-zinc-950" />
      </div>

      {/* ── About / Summary ── */}
      {(data.bio || ed) && (
        <Section title="About Me" accentColor={accentColor}>
          <Editable as="p" multiline className="text-zinc-700 leading-relaxed whitespace-pre-wrap"
            value={data.bio} editable={ed} editKey={`${ek}-bio`} placeholder="Add a short professional summary"
            onChange={(v) => editing?.updateField("bio", v)} />
        </Section>
      )}

      {/* ── Skills ── */}
      {(allSkills.length > 0 || ed) && (
        <Section title="Skills & Technologies" accentColor={accentColor}>
          <SkillsEditor
            skills={allSkills}
            editable={ed}
            textClassName="text-[12.5px] text-zinc-800"
            onChange={(next) => {
              editing?.updateField("skills", next);
              editing?.updateField("technologies", []);
            }}
          >
            <div className="space-y-1.5">
              {skillGroups.map((g, gi) => (
                <div key={gi} className="flex items-baseline gap-2">
                  {g.label && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-950 shrink-0 min-w-[110px]">
                      {g.label}:
                    </span>
                  )}
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                    {g.items.map((s, i) => (
                      <span key={i}>
                        <span className="text-zinc-700">{s}</span>
                        {i < g.items.length - 1 && <span className="text-zinc-300 mx-1">·</span>}
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
        <Section title="Work Experience" accentColor={accentColor}>
          <div className="space-y-5">
            {data.experiences.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <Editable className="font-bold text-zinc-950 text-[13px]" value={e.title} editable={ed} editKey={`${ek}-exp-title-${e.id}`}
                      onChange={(v) => editing?.updateExperience(e.id, { title: v })} />
                    <span className="text-zinc-600"> — </span>
                    <Editable className="text-zinc-600" value={e.company} editable={ed} editKey={`${ek}-exp-co-${e.id}`}
                      onChange={(v) => editing?.updateExperience(e.id, { company: v })} />
                    {(e.location || ed) && (<>
                      <span className="text-zinc-400 text-[11px]"> · </span>
                      <Editable className="text-zinc-400 text-[11px]" value={e.location} editable={ed} editKey={`${ek}-exp-loc-${e.id}`} placeholder="location"
                        onChange={(v) => editing?.updateExperience(e.id, { location: v })} />
                    </>)}
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap ml-4 italic">
                    {e.startDate} – {e.endDate}
                  </span>
                </div>
                {(e.description || ed) && (
                  ed ? (
                    <Editable as="div" multiline className="mt-1.5 text-zinc-700 whitespace-pre-wrap"
                      value={e.description} editable={ed} editKey={`${ek}-exp-desc-${e.id}`} placeholder="One bullet per line"
                      onChange={(v) => editing?.updateExperience(e.id, { description: v })} />
                  ) : (
                    <ul className="mt-1.5 space-y-0.5 ml-1">
                      {e.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex gap-2 text-zinc-700">
                          <span className="shrink-0 mt-1" style={{ color: accentColor }}>•</span>
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

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <Section title="Projects" accentColor={accentColor}>
          <div className="space-y-4">
            {data.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Editable className="font-bold text-zinc-950" value={p.title} editable={ed} editKey={`${ek}-proj-title-${p.id}`}
                    onChange={(v) => editing?.updateProject(p.id, { title: v })} />
                  {p.technologies.length > 0 && (
                    <span className="text-[11px]" style={{ color: accentColor }}>
                      {p.technologies.join(", ")}
                    </span>
                  )}
                </div>
                {(p.description || ed) && (
                  <Editable as="p" multiline className="text-zinc-700 mt-0.5 leading-relaxed whitespace-pre-wrap"
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
        </Section>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <Section title="Education" accentColor={accentColor}>
          <div className="space-y-3">
            {data.education.map((e) => (
              <div key={e.id} className="flex justify-between">
                <div>
                  <Editable className="font-bold text-zinc-950" value={e.degree} editable={ed} editKey={`${ek}-edu-deg-${e.id}`}
                    onChange={(v) => editing?.updateEducation(e.id, { degree: v })} />
                  {(e.field || ed) && (<>
                    <span className="text-zinc-950"> in </span>
                    <Editable className="font-bold text-zinc-950" value={e.field} editable={ed} editKey={`${ek}-edu-field-${e.id}`} placeholder="field"
                      onChange={(v) => editing?.updateEducation(e.id, { field: v })} />
                  </>)}
                  <span className="text-zinc-600"> — </span>
                  <Editable className="text-zinc-600" value={e.institution} editable={ed} editKey={`${ek}-edu-inst-${e.id}`}
                    onChange={(v) => editing?.updateEducation(e.id, { institution: v })} />
                  {(e.gpa || ed) && (<>
                    <span className="text-zinc-400 text-[11px]"> · GPA: </span>
                    <Editable className="text-zinc-400 text-[11px]" value={e.gpa} editable={ed} editKey={`${ek}-edu-gpa-${e.id}`} placeholder="—"
                      onChange={(v) => editing?.updateEducation(e.id, { gpa: v })} />
                  </>)}
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
                  <Editable className="font-semibold text-zinc-950" value={c.name} editable={ed} editKey={`${ek}-cert-name-${c.id}`}
                    onChange={(v) => editing?.updateCertification(c.id, { name: v })} />
                  <span className="text-zinc-600"> — </span>
                  <Editable className="text-zinc-600" value={c.issuer} editable={ed} editKey={`${ek}-cert-issuer-${c.id}`}
                    onChange={(v) => editing?.updateCertification(c.id, { issuer: v })} />
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
