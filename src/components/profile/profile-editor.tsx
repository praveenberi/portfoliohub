"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  LinkSimple,
  Wrench,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Certificate,
  Star,
  Plus,
  X,
  FloppyDisk,
  Pencil,
  Trash,
  CheckCircle,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { parseArr, parseProjectImages } from "@/lib/utils";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { TagAutocompleteInput } from "@/components/ui/tag-autocomplete-input";
import {
  LOCATION_SUGGESTIONS,
  JOB_TITLE_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  TECH_SUGGESTIONS,
  DEGREE_SUGGESTIONS,
  FIELD_SUGGESTIONS,
  CERT_ISSUER_SUGGESTIONS,
  HEADLINE_SUGGESTIONS,
} from "@/lib/suggestions";
import type {
  Profile,
  Experience,
  Education,
  Project,
  Certification,
  Extra,
} from "@prisma/client";

type FullProfile = Profile & {
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  extras: Extra[];
};

interface Props {
  profile: FullProfile | null;
  user: { name: string | null; email: string | null; image: string | null; username: string | null } | null;
}

const inputCls =
  "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors";

const TABS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "social", label: "Social", icon: LinkSimple },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "certifications", label: "Certifications", icon: Certificate },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileEditor({ profile, user }: Props) {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Edit Profile</h1>
          <p className="text-sm text-zinc-500 mt-1">Keep your information up to date</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "basic" && <BasicInfoEditor profile={profile} />}
            {activeTab === "social" && <SocialLinksEditor profile={profile} />}
            {activeTab === "skills" && <SkillsEditor profile={profile} />}
            {activeTab === "experience" && (
              <ExperienceEditor experiences={profile?.experiences ?? []} profileId={profile?.id} />
            )}
            {activeTab === "education" && (
              <EducationEditor education={profile?.education ?? []} profileId={profile?.id} />
            )}
            {activeTab === "projects" && (
              <ProjectsEditor projects={profile?.projects ?? []} profileId={profile?.id} />
            )}
            {activeTab === "certifications" && (
              <CertificationEditor certifications={profile?.certifications ?? []} profileId={profile?.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Basic Info ───────────────────────────────────────────────────────────────

const basicSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  openToWork: z.boolean().optional(),
});

function BasicInfoEditor({ profile }: { profile: FullProfile | null }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      headline: profile?.headline ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      phone: profile?.phone ?? "",
      website: profile?.website ?? "",
      openToWork: profile?.openToWork ?? false,
    },
  });
  const [locationVal, setLocationVal] = useState(profile?.location ?? "");
  const [headlineVal, setHeadlineVal] = useState(profile?.headline ?? "");

  async function onSubmit(data: z.infer<typeof basicSchema>) {
    setSaving(true);
    try {
      await axios.patch("/api/profile", data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">First name</label>
          <input {...register("firstName")} className={inputCls} placeholder="Alex" />
          {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Last name</label>
          <input {...register("lastName")} className={inputCls} placeholder="Kim" />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Headline</label>
        <AutocompleteInput
          value={headlineVal}
          onChange={(v) => { setHeadlineVal(v); setValue("headline", v); }}
          suggestions={HEADLINE_SUGGESTIONS}
          placeholder="Full-stack developer & open-source contributor"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Bio</label>
        <textarea {...register("bio")} rows={4} className={`${inputCls} resize-none`} placeholder="Tell your story..." />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Location</label>
          <AutocompleteInput
            value={locationVal}
            onChange={(v) => { setLocationVal(v); setValue("location", v); }}
            suggestions={LOCATION_SUGGESTIONS}
            placeholder="San Francisco, CA"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Phone</label>
          <input {...register("phone")} className={inputCls} placeholder="+1 555 000 0000" />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Website</label>
        <input {...register("website")} className={inputCls} placeholder="https://yoursite.com" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register("openToWork")} className="accent-green-500" />
        <span className="text-sm text-zinc-300">Open to work</span>
      </label>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
      >
        <FloppyDisk size={14} /> {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────

function SocialLinksEditor({ profile }: { profile: FullProfile | null }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    linkedinUrl: profile?.linkedinUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    twitterUrl: profile?.twitterUrl ?? "",
    instagramUrl: (profile as any)?.instagramUrl ?? "",
    website: profile?.website ?? "",
  });

  async function save() {
    setSaving(true);
    try {
      await axios.patch("/api/profile", form);
      toast.success("Links updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">LinkedIn</label>
        <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/username" />
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">GitHub</label>
        <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className={inputCls} placeholder="https://github.com/username" />
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Twitter / X</label>
        <input value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} className={inputCls} placeholder="https://twitter.com/username" />
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Instagram</label>
        <input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} className={inputCls} placeholder="https://instagram.com/username" />
      </div>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Website</label>
        <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} placeholder="https://yoursite.com" />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
      >
        <FloppyDisk size={14} /> {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function SkillsEditor({ profile }: { profile: FullProfile | null }) {
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>(parseArr(profile?.skills));
  const [technologies, setTechnologies] = useState<string[]>(parseArr(profile?.technologies));
  const [skillInput, setSkillInput] = useState("");
  const [techInput, setTechInput] = useState("");

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  }

  function addTech() {
    const v = techInput.trim();
    if (v && !technologies.includes(v)) setTechnologies([...technologies, v]);
    setTechInput("");
  }

  async function save() {
    setSaving(true);
    try {
      await axios.patch("/api/profile", { skills, technologies });
      toast.success("Skills updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <label className="text-xs text-zinc-500 mb-2 block font-medium uppercase tracking-wider">Skills</label>
        <div className="flex gap-2 mb-3">
          <TagAutocompleteInput
            value={skillInput}
            onChange={setSkillInput}
            onAdd={addSkill}
            suggestions={SKILL_SUGGESTIONS}
            existingTags={skills}
            placeholder="Add a skill and press Enter"
            className={inputCls}
          />
          <button onClick={addSkill} className="px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800 rounded-full text-zinc-300">
              {s}
              <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:text-white">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div>
        <label className="text-xs text-zinc-500 mb-2 block font-medium uppercase tracking-wider">Technologies</label>
        <div className="flex gap-2 mb-3">
          <TagAutocompleteInput
            value={techInput}
            onChange={setTechInput}
            onAdd={addTech}
            suggestions={TECH_SUGGESTIONS}
            existingTags={technologies}
            placeholder="Add a technology and press Enter"
            className={inputCls}
          />
          <button onClick={addTech} className="px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {technologies.map((t) => (
            <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800 rounded-full text-zinc-300">
              {t}
              <button onClick={() => setTechnologies(technologies.filter((x) => x !== t))} className="hover:text-white">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
      >
        <FloppyDisk size={14} /> {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

// ─── Experience Editor ────────────────────────────────────────────────────────

function ExperienceEditor({ experiences: initial, profileId }: { experiences: Experience[]; profileId?: string }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const blank = { title: "", company: "", location: "", startDate: "", endDate: "", isCurrent: "false", description: "", skills: "" };
  const [form, setForm] = useState(blank);

  function startNew() {
    setForm(blank);
    setEditing("new");
  }

  function startEdit(exp: Experience) {
    setForm({
      title: exp.title,
      company: exp.company,
      location: exp.location ?? "",
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : "",
      isCurrent: exp.isCurrent ? "true" : "false",
      description: exp.description ?? "",
      skills: parseArr(exp.skills).join(", "),
    });
    setEditing(exp.id);
  }

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const isCurrent = form.isCurrent === "true";
      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: !isCurrent && form.endDate ? `${form.endDate}-01` : null,
        isCurrent,
        description: form.description,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        order: items.length,
      };
      if (editing === "new") {
        const res = await axios.post("/api/profile/experience", payload);
        setItems([...items, res.data.data]);
      } else if (editing) {
        const res = await axios.patch(`/api/profile/experience/${editing}`, payload);
        setItems(items.map((i) => (i.id === editing ? res.data.data : i)));
      }
      toast.success("Saved");
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await axios.delete(`/api/profile/experience/${id}`);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      {items.map((exp) => (
        <div key={exp.id} className="p-4 border border-zinc-800 rounded-xl">
          {editing === exp.id ? (
            <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-100">{exp.title}</p>
                <p className="text-sm text-zinc-400">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {" — "}
                  {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(exp)} className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(exp.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
      {editing === "new" && (
        <div className="p-4 border border-zinc-700 rounded-xl">
          <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}
      {editing === null && (
        <button onClick={startNew} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-medium rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors">
          <Plus size={14} /> Add experience
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExperienceForm({ form, setForm, onSave, onCancel, saving }: { form: Record<string, string>; setForm: (v: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <AutocompleteInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} suggestions={JOB_TITLE_SUGGESTIONS} placeholder="Job title" className={inputCls} />
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Company" />
      </div>
      <AutocompleteInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} suggestions={LOCATION_SUGGESTIONS} placeholder="Location (optional)" className={inputCls} />
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Start date</label>
          <input type="month" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">End date</label>
          <input type="month" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} disabled={form.isCurrent === "true"} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isCurrent === "true"} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked ? "true" : "false", endDate: e.target.checked ? "" : form.endDate })} className="accent-green-500" />
        <span className="text-sm text-zinc-400">Currently working here</span>
      </label>
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 resize-none`} placeholder="Describe your role and achievements..." />
      <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className={inputCls} placeholder="Skills used (comma-separated): React, TypeScript" />
      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white border border-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
          <CheckCircle size={14} /> {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Education Editor ─────────────────────────────────────────────────────────

function EducationEditor({ education: initial, profileId }: { education: Education[]; profileId?: string }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const blank = { institution: "", degree: "", field: "", startDate: "", endDate: "", isCurrent: "false", gpa: "", description: "" };
  const [form, setForm] = useState(blank);

  function startNew() {
    setForm(blank);
    setEditing("new");
  }

  function startEdit(edu: Education) {
    setForm({
      institution: edu.institution,
      degree: edu.degree ?? "",
      field: edu.field ?? "",
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 7) : "",
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 7) : "",
      isCurrent: edu.isCurrent ? "true" : "false",
      gpa: edu.gpa ?? "",
      description: edu.description ?? "",
    });
    setEditing(edu.id);
  }

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const isCurrent = form.isCurrent === "true";
      const payload = {
        institution: form.institution,
        degree: form.degree,
        field: form.field,
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: !isCurrent && form.endDate ? `${form.endDate}-01` : null,
        isCurrent,
        gpa: form.gpa,
        description: form.description,
        order: items.length,
      };
      if (editing === "new") {
        const res = await axios.post("/api/profile/education", payload);
        setItems([...items, res.data.data]);
      } else if (editing) {
        const res = await axios.patch(`/api/profile/education/${editing}`, payload);
        setItems(items.map((i) => (i.id === editing ? res.data.data : i)));
      }
      toast.success("Saved");
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await axios.delete(`/api/profile/education/${id}`);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      {items.map((edu) => (
        <div key={edu.id} className="p-4 border border-zinc-800 rounded-xl">
          {editing === edu.id ? (
            <EducationForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-100">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                <p className="text-sm text-zinc-400">{edu.institution}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {" — "}
                  {edu.isCurrent ? "Present" : edu.endDate ? new Date(edu.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(edu)} className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(edu.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
      {editing === "new" && (
        <div className="p-4 border border-zinc-700 rounded-xl">
          <EducationForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}
      {editing === null && (
        <button onClick={startNew} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-medium rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors">
          <Plus size={14} /> Add education
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EducationForm({ form, setForm, onSave, onCancel, saving }: { form: Record<string, string>; setForm: (v: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="space-y-3">
      <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className={inputCls} placeholder="Institution name" />
      <div className="grid md:grid-cols-2 gap-3">
        <AutocompleteInput value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} suggestions={DEGREE_SUGGESTIONS} placeholder="Degree (e.g. B.Sc.)" className={inputCls} />
        <AutocompleteInput value={form.field} onChange={(v) => setForm({ ...form, field: v })} suggestions={FIELD_SUGGESTIONS} placeholder="Field of study" className={inputCls} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Start date</label>
          <input type="month" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">End date</label>
          <input type="month" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} disabled={form.isCurrent === "true"} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isCurrent === "true"} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked ? "true" : "false", endDate: e.target.checked ? "" : form.endDate })} className="accent-green-500" />
        <span className="text-sm text-zinc-400">Currently studying here</span>
      </label>
      <input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className={inputCls} placeholder="GPA (optional)" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-16 resize-none`} placeholder="Activities, achievements..." />
      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white border border-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
          <CheckCircle size={14} /> {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Projects Editor ──────────────────────────────────────────────────────────

function ProjectsEditor({ projects: initial, profileId }: { projects: Project[]; profileId?: string }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const blank = { title: "", description: "", technologies: "", startDate: "", endDate: "", liveUrl: "", githubUrl: "", imageUrl: "" };
  const [form, setForm] = useState(blank);

  function startNew() {
    setForm(blank);
    setEditing("new");
  }

  function startEdit(p: Project) {
    setForm({
      title: p.title,
      description: p.description ?? "",
      technologies: parseArr(p.technologies).join(", "),
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 7) : "",
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 7) : "",
      liveUrl: p.liveUrl ?? "",
      githubUrl: p.githubUrl ?? "",
      imageUrl: p.imageUrl ?? "",
    });
    setEditing(p.id);
  }

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        technologies: form.technologies.split(",").map((s) => s.trim()).filter(Boolean),
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: form.endDate ? `${form.endDate}-01` : null,
        liveUrl: form.liveUrl,
        githubUrl: form.githubUrl,
        imageUrl: form.imageUrl,
        order: items.length,
      };
      if (editing === "new") {
        const res = await axios.post("/api/profile/project", payload);
        setItems([...items, res.data.data]);
      } else if (editing) {
        const res = await axios.patch(`/api/profile/project/${editing}`, payload);
        setItems(items.map((i) => (i.id === editing ? res.data.data : i)));
      }
      toast.success("Saved");
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await axios.delete(`/api/profile/project/${id}`);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      {items.map((p) => {
        const imgs = parseProjectImages(p.imageUrl);
        return (
          <div key={p.id} className="p-4 border border-zinc-800 rounded-xl">
            {editing === p.id ? (
              <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
            ) : (
              <div>
                {/* Image grid */}
                {imgs.length > 0 && (
                  <div className={`mb-3 ${imgs.length > 9 ? "max-h-64 overflow-y-auto pr-0.5" : ""}`}>
                    <div className={`grid gap-2 ${imgs.length === 1 ? "grid-cols-1" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {imgs.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`${p.title} ${i + 1}`} className="w-full aspect-video object-cover rounded-lg border border-zinc-800" />
                      ))}
                    </div>
                    {imgs.length > 9 && (
                      <p className="text-center text-xs text-zinc-600 mt-1">{imgs.length} photos · scroll to see all</p>
                    )}
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-100">{p.title}</p>
                    {p.description && <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{p.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {parseArr(p.technologies).slice(0, 4).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(p)} className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(p.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {editing === "new" && (
        <div className="p-4 border border-zinc-700 rounded-xl">
          <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}
      {editing === null && (
        <button onClick={startNew} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-medium rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors">
          <Plus size={14} /> Add project
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectForm({ form, setForm, onSave, onCancel, saving }: { form: Record<string, string>; setForm: (v: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // images stored as JSON array in form.imageUrl
  const images = parseProjectImages(form.imageUrl);

  function syncImages(next: string[]) {
    setForm({ ...form, imageUrl: JSON.stringify(next) });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await axios.post("/api/upload", fd);
        uploaded.push(res.data.url);
      }
      syncImages([...images, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    syncImages([...images, url]);
    setUrlInput("");
  }

  function removeImage(index: number) {
    syncImages(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Project title" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 resize-none`} placeholder="What did you build? What problem did it solve?" />
      <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} className={inputCls} placeholder="Technologies (comma-separated): React, Next.js, Prisma" />
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Start date</label>
          <input type="month" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">End date</label>
          <input type="month" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className={inputCls} placeholder="Live URL (optional)" />
        <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className={inputCls} placeholder="GitHub URL (optional)" />
      </div>

      {/* ── Images ─────────────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-zinc-500 mb-2 block">Project images</label>

        {/* Grid of uploaded images */}
        {images.length > 0 && (
          <div className={`mb-3 ${images.length > 9 ? "max-h-64 overflow-y-auto pr-0.5" : ""}`}>
            <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-2" : "grid-cols-3"}`}>
              {images.map((url, i) => (
                <div key={i} className="relative group aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-zinc-800" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            {images.length > 9 && (
              <p className="text-center text-xs text-zinc-600 mt-1">{images.length} photos · scroll to see all</p>
            )}
          </div>
        )}

        {/* Upload button */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full px-3 py-3 border border-dashed border-zinc-700 rounded-lg text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors mb-2"
        >
          <CloudArrowUp size={15} />
          {uploading ? "Uploading..." : "Click to upload images (multiple allowed)"}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            className={inputCls}
            placeholder="Or paste image URL and press Enter"
          />
          <button type="button" onClick={addUrl} className="px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex-shrink-0 text-xs text-zinc-300">
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white border border-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
          <CheckCircle size={14} /> {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Certification Editor ─────────────────────────────────────────────────────

function CertificationEditor({ certifications: initial, profileId }: { certifications: Certification[]; profileId?: string }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const blank = { name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" };
  const [form, setForm] = useState(blank);

  function startNew() {
    setForm(blank);
    setEditing("new");
  }

  function startEdit(cert: Certification) {
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().slice(0, 7) : "",
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().slice(0, 7) : "",
      credentialId: cert.credentialId ?? "",
      credentialUrl: cert.credentialUrl ?? "",
    });
    setEditing(cert.id);
  }

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        issueDate: form.issueDate ? new Date(`${form.issueDate}-01`).toISOString() : null,
        expiryDate: form.expiryDate ? new Date(`${form.expiryDate}-01`).toISOString() : null,
        order: items.length,
      };
      if (editing === "new") {
        const res = await axios.post("/api/profile/certification", payload);
        setItems([...items, res.data.data]);
      } else if (editing) {
        const res = await axios.patch(`/api/profile/certification/${editing}`, payload);
        setItems(items.map((i) => (i.id === editing ? res.data.data : i)));
      }
      toast.success("Saved");
      setEditing(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await axios.delete(`/api/profile/certification/${id}`);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      {items.map((cert) => (
        <div key={cert.id} className="p-4 border border-zinc-800 rounded-xl">
          {editing === cert.id ? (
            <CertificationForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-100">{cert.name}</p>
                <p className="text-sm text-zinc-400">{cert.issuer}</p>
                {cert.issueDate && (
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Issued {new Date(cert.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    {cert.expiryDate ? ` · Expires ${new Date(cert.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}
                  </p>
                )}
                {cert.credentialId && <p className="text-xs text-zinc-600">ID: {cert.credentialId}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(cert)} className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(cert.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
      {editing === "new" && (
        <div className="p-4 border border-zinc-700 rounded-xl">
          <CertificationForm form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      )}
      {editing === null && (
        <button onClick={startNew} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-medium rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors">
          <Plus size={14} /> Add certification
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CertificationForm({ form, setForm, onSave, onCancel, saving }: { form: Record<string, string>; setForm: (v: any) => void; onSave: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div className="space-y-3">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Certification name" />
      <AutocompleteInput value={form.issuer} onChange={(v) => setForm({ ...form, issuer: v })} suggestions={CERT_ISSUER_SUGGESTIONS} placeholder="Issuing organization" className={inputCls} />
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Issue date</label>
          <input type="month" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Expiry date</label>
          <input type="month" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className={inputCls} />
        </div>
      </div>
      <input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} className={inputCls} placeholder="Credential ID (optional)" />
      <input value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} className={inputCls} placeholder="Credential URL (optional)" />
      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white border border-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
          <CheckCircle size={14} /> {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Star rating (unused, kept for future) ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition-colors">
          <Star size={14} weight={n <= value ? "fill" : "regular"} className={n <= value ? "text-yellow-400" : "text-zinc-700"} />
        </button>
      ))}
    </div>
  );
}
