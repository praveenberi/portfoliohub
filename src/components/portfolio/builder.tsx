"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  DotsSixVertical,
  Eye,
  EyeSlash,
  Plus,
  Trash,
  ArrowLeft,
  DeviceMobile,
  Monitor,
  FloppyDisk,
  Sparkle,
  Image as ImageIcon,
  Video,
  X,
  CloudArrowUp,
  PencilSimple,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import type { Portfolio, Profile, Experience, Education, Project, Certification } from "@prisma/client";
import type { UserRole } from "@/lib/enums";
import type { SectionConfig, SectionType, PortfolioConfig, HeroContent, BackgroundStyle } from "@/types";
import { parseArr, parseJson, parseProjectImages } from "@/lib/utils";
import { GridBackground, DotBackground, AuroraBackground, Meteors } from "./animations";

const AVAILABLE_SECTIONS: { type: SectionType; label: string; description: string }[] = [
  { type: "hero", label: "Hero", description: "Full-width intro with your name and headline" },
  { type: "about", label: "About", description: "Personal bio and introduction" },
  { type: "skills", label: "Skills", description: "Technical skills and technologies" },
  { type: "projects", label: "Projects", description: "Portfolio projects with images" },
  { type: "experience", label: "Experience", description: "Work history and companies" },
  { type: "education", label: "Education", description: "Academic background" },
  { type: "certifications", label: "Certifications", description: "Licenses and professional certifications" },
  { type: "extras", label: "Extras", description: "Awards, languages, publications, volunteer work" },
  { type: "contact", label: "Contact", description: "Contact form and social links" },
  { type: "testimonials", label: "Testimonials", description: "Recommendations and endorsements" },
];

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", type: "hero", title: "Hero", visible: true, order: 0, content: {} },
  { id: "about", type: "about", title: "About Me", visible: true, order: 1, content: {} },
  { id: "skills", type: "skills", title: "Skills", visible: true, order: 2, content: {} },
  { id: "projects", type: "projects", title: "Projects", visible: true, order: 3, content: {} },
  { id: "experience", type: "experience", title: "Experience", visible: true, order: 4, content: {} },
  { id: "contact", type: "contact", title: "Contact", visible: true, order: 5, content: {} },
];

const FONT_MAP: Record<string, { family: string; url?: string; label: string }> = {
  geist: { family: "Inter, ui-sans-serif, system-ui, sans-serif", label: "Inter (Geist)" },
  satoshi: { family: "'DM Sans', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap", label: "DM Sans" },
  outfit: { family: "'Outfit', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap", label: "Outfit" },
  "cabinet-grotesk": { family: "'Plus Jakarta Sans', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap", label: "Plus Jakarta Sans" },
};

const BG_STYLES: { value: BackgroundStyle; label: string; preview: React.ReactNode }[] = [
  {
    value: "solid",
    label: "Solid",
    preview: <div className="w-full h-full bg-white rounded" />,
  },
  {
    value: "grid",
    label: "Grid",
    preview: (
      <div
        className="w-full h-full rounded"
        style={{
          backgroundImage:
            "linear-gradient(#22c55e18 1px, transparent 1px), linear-gradient(90deg, #22c55e18 1px, transparent 1px)",
          backgroundSize: "10px 10px",
          backgroundColor: "white",
        }}
      />
    ),
  },
  {
    value: "dots",
    label: "Dots",
    preview: (
      <div
        className="w-full h-full rounded"
        style={{
          backgroundImage: "radial-gradient(#22c55e30 1px, transparent 1px)",
          backgroundSize: "6px 6px",
          backgroundColor: "white",
        }}
      />
    ),
  },
  {
    value: "aurora",
    label: "Aurora",
    preview: (
      <div
        className="w-full h-full rounded overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, #22c55e30, transparent 50%), radial-gradient(ellipse at 80% 20%, #22c55e20, transparent 50%), #f9fafb",
        }}
      />
    ),
  },
  {
    value: "meteors",
    label: "Meteors",
    preview: (
      <div className="w-full h-full rounded bg-zinc-950 overflow-hidden relative">
        <div
          className="absolute top-1 left-1/4 w-0.5 h-3 rounded-full"
          style={{ background: "linear-gradient(to bottom, #22c55e, transparent)" }}
        />
        <div
          className="absolute top-2 left-2/3 w-0.5 h-2 rounded-full"
          style={{ background: "linear-gradient(to bottom, #22c55e, transparent)" }}
        />
      </div>
    ),
  },
  {
    value: "image",
    label: "Photo",
    preview: (
      <div className="w-full h-full rounded bg-zinc-200 overflow-hidden relative flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    ),
  },
];

interface BuilderProps {
  portfolio: Portfolio;
  profile: (Profile & { experiences: Experience[]; education: Education[]; projects: Project[]; certifications: Certification[]; extras: import("@prisma/client").Extra[] }) | null;
  user: { id: string; name?: string | null; email?: string | null; username?: string | null; role: UserRole };
}

export function PortfolioBuilder({ portfolio, profile, user }: BuilderProps) {
  const parsedSections = parseJson<SectionConfig[]>(portfolio.sections as string, []);
  const existingSections = parsedSections.length > 0 ? parsedSections : DEFAULT_SECTIONS;

  const [sections, setSections] = useState<SectionConfig[]>(existingSections);
  const [liveProfile, setLiveProfile] = useState(profile);
  const [config, setConfig] = useState<PortfolioConfig>({
    primaryColor: "#22c55e",
    backgroundColor: "#ffffff",
    textColor: "#09090b",
    accentColor: "#22c55e",
    fontFamily: "geist",
    borderRadius: "md",
    spacing: "normal",
    animationsEnabled: true,
    backgroundStyle: "solid",
    ...parseJson<Partial<PortfolioConfig>>(portfolio.config as string, {}),
  });
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activePanel, setActivePanel] = useState<"sections" | "design" | "seo">("sections");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    });
  };

  const toggleSectionVisibility = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const addSection = (type: SectionType) => {
    if (sections.find((s) => s.type === type)) {
      toast("Section already added");
      return;
    }
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: AVAILABLE_SECTIONS.find((s) => s.type === type)?.label ?? type,
      visible: true,
      order: sections.length,
      content: {},
    };
    setSections((prev) => [...prev, newSection]);
  };

  const updateSectionContent = (id: string, content: Record<string, unknown>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...content } } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/portfolios/${portfolio.id}`, { sections, config });
      toast.success("Portfolio saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const activeDragSection = sections.find((s) => s.id === activeDragId);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const isMeteorBg = config.backgroundStyle === "meteors" || config.backgroundStyle === "image";

  // Scroll preview to the selected section
  useEffect(() => {
    if (!selectedSectionId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`preview-${selectedSectionId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden">
      {/* Left panel */}
      <div className="w-72 bg-white border-r border-zinc-200 flex flex-col flex-shrink-0">
        {/* Panel tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-zinc-100">
          {(["sections", "design", "seo"] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                activePanel === panel ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              {panel}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* ── Sections panel ── */}
          {activePanel === "sections" && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
                Active sections
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {sections.map((section) => (
                        <SortableSectionItem
                          key={section.id}
                          section={section}
                          isSelected={selectedSectionId === section.id}
                          onSelect={() =>
                            setSelectedSectionId(selectedSectionId === section.id ? null : section.id)
                          }
                          onToggleVisible={() => toggleSectionVisibility(section.id)}
                          onRemove={() => removeSection(section.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeDragSection && (
                    <div className="bg-white border-2 border-green-500 rounded-xl px-3 py-2.5 shadow-lg opacity-90">
                      <span className="text-sm font-medium text-zinc-950">{activeDragSection.title}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>

              {/* Section editor (shown when any section is selected) */}
              <AnimatePresence>
                {selectedSection && (
                  <motion.div
                    key={selectedSection.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SectionEditor
                      section={selectedSection}
                      profile={liveProfile}
                      onProfileUpdate={setLiveProfile}
                      onChange={(c) => updateSectionContent(selectedSection.id, c)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add section */}
              <div className="border-t border-zinc-100 pt-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1 mb-2">
                  Add sections
                </div>
                <div className="space-y-1">
                  {AVAILABLE_SECTIONS.filter((s) => !sections.find((e) => e.type === s.type)).map((s) => (
                    <button
                      key={s.type}
                      onClick={() => addSection(s.type)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-left group"
                    >
                      <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                        <Plus size={12} className="text-zinc-400 group-hover:text-green-500" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-700">{s.label}</div>
                        <div className="text-[10px] text-zinc-400">{s.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Design panel ── */}
          {activePanel === "design" && (
            <div className="space-y-5">
              {/* Background style */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Background style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BG_STYLES.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setConfig((c) => ({ ...c, backgroundStyle: bg.value }))}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-all ${
                        config.backgroundStyle === bg.value
                          ? "border-green-500 bg-green-50"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="w-full h-8 overflow-hidden rounded">{bg.preview}</div>
                      <span className={`text-[10px] font-medium ${config.backgroundStyle === bg.value ? "text-green-700" : "text-zinc-500"}`}>
                        {bg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background image (shown only for "image" style) */}
              {config.backgroundStyle === "image" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700">Background Photo</label>

                  {/* Upload from desktop */}
                  <label className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:bg-zinc-50 cursor-pointer transition-colors">
                    <CloudArrowUp size={14} />
                    Upload from desktop
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        toast.loading("Uploading…", { id: "bg-upload" });
                        try {
                          const res = await axios.post("/api/upload", formData);
                          setConfig((c) => ({ ...c, backgroundImageUrl: res.data.url }));
                          toast.success("Photo uploaded", { id: "bg-upload" });
                        } catch {
                          toast.error("Upload failed", { id: "bg-upload" });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {/* Or paste URL */}
                  <input
                    type="url"
                    value={config.backgroundImageUrl?.startsWith("data:") ? "" : (config.backgroundImageUrl ?? "")}
                    placeholder="Or paste image URL…"
                    onChange={(e) => setConfig((c) => ({ ...c, backgroundImageUrl: e.target.value || undefined }))}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
                  />

                  {/* Preview */}
                  {config.backgroundImageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={config.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setConfig((c) => ({ ...c, backgroundImageUrl: undefined }))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={10} weight="bold" />
                      </button>
                    </div>
                  )}

                  <label className="text-xs font-semibold text-zinc-700">Overlay darkness ({config.backgroundImageOverlay ?? 40}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    value={config.backgroundImageOverlay ?? 40}
                    onChange={(e) => setConfig((c) => ({ ...c, backgroundImageOverlay: Number(e.target.value) }))}
                    className="w-full accent-green-500"
                  />
                </div>
              )}

              {/* Background color (hidden for meteors/dark/image) */}
              {!isMeteorBg && config.backgroundStyle !== "image" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700">Background color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                      className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                      className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              )}

              {/* Accent color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Accent color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig((c) => ({ ...c, primaryColor: e.target.value, accentColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig((c) => ({ ...c, primaryColor: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Text color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Heading text color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig((c) => ({ ...c, textColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => setConfig((c) => ({ ...c, textColor: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Secondary text color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Description text color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.secondaryTextColor ?? "#71717a"}
                    onChange={(e) => setConfig((c) => ({ ...c, secondaryTextColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.secondaryTextColor ?? "#71717a"}
                    onChange={(e) => setConfig((c) => ({ ...c, secondaryTextColor: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Font */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Font family</label>
                <select
                  value={config.fontFamily ?? "geist"}
                  onChange={(e) => setConfig((c) => ({ ...c, fontFamily: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
                >
                  {Object.entries(FONT_MAP).map(([key, f]) => (
                    <option key={key} value={key}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Corner style */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Corner style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sm", "md", "lg"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setConfig((c) => ({ ...c, borderRadius: r }))}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        config.borderRadius === r
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      {r === "sm" ? "Sharp" : r === "md" ? "Round" : "Pill"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700">Font size</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["sm", "md", "lg", "xl"] as const).map((s) => (
                    <button key={s} onClick={() => setConfig((c) => ({ ...c, fontSize: s }))}
                      className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${(config.fontSize ?? "md") === s ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-700">Animations</div>
                  <div className="text-[10px] text-zinc-400">Scroll & hover effects</div>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, animationsEnabled: !c.animationsEnabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors overflow-hidden flex-shrink-0 ${
                    config.animationsEnabled ? "bg-green-500" : "bg-zinc-200"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      config.animationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ── SEO panel ── */}
          {activePanel === "seo" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">SEO title</label>
                <input
                  type="text"
                  defaultValue={portfolio.seoTitle ?? portfolio.title}
                  placeholder="Your Name — Developer"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Meta description</label>
                <textarea
                  defaultValue={portfolio.seoDescription ?? ""}
                  placeholder="Describe your portfolio in 1-2 sentences..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Custom domain</label>
                <input
                  type="text"
                  defaultValue={portfolio.customDomain ?? ""}
                  placeholder="yourname.com"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
                />
                <p className="text-[10px] text-zinc-400">Point your domain&apos;s CNAME to our servers.</p>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 h-9 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FloppyDisk size={14} /> Publish to website</>
            )}
          </button>
        </div>
      </div>

      {/* Center — preview */}
      <div className="flex-1 flex flex-col bg-zinc-100 overflow-hidden">
        {/* Builder toolbar */}
        <div className="flex items-center justify-between px-4 h-12 bg-white border-b border-zinc-200">
          <Link href="/dashboard/portfolio" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-zinc-200"}`}
            >
              <Monitor size={14} className={viewMode === "desktop" ? "text-zinc-950" : "text-zinc-400"} />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-zinc-200"}`}
            >
              <DeviceMobile size={14} className={viewMode === "mobile" ? "text-zinc-950" : "text-zinc-400"} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors">
              <Sparkle size={13} /> AI assist
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <FloppyDisk size={13} />
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto flex justify-center p-6">
          <div
            className={`shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ${
              viewMode === "mobile" ? "w-[390px] rounded-[2rem]" : "w-full max-w-4xl rounded-2xl"
            }`}
          >
            <PortfolioPreview sections={sections} config={config} profile={liveProfile} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Editor (dispatcher) ─────────────────────────────────────────────

function SectionEditor({
  section,
  profile,
  onProfileUpdate,
  onChange,
}: {
  section: SectionConfig;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  return (
    <div className="border-t border-zinc-100 pt-4 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-zinc-950">{section.title}</span>
        <span className="text-[10px] text-zinc-400 capitalize">{section.type}</span>
      </div>

      {section.type !== "hero" && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Section title</label>
          <input
            type="text"
            value={(section.content.titleOverride as string) ?? ""}
            placeholder={section.title}
            onChange={(e) => onChange({ titleOverride: e.target.value || undefined })}
            className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
          />
        </div>
      )}

      {section.type === "hero" && (
        <HeroMediaEditor content={section.content as HeroContent} onChange={onChange} />
      )}
      {section.type === "about" && (
        <AboutEditor content={section.content} onChange={onChange} />
      )}
      {section.type === "skills" && (
        <SkillsEditor content={section.content} profile={profile} onChange={onChange} />
      )}
      {section.type === "projects" && (
        <ProjectsEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "experience" && (
        <ExperienceEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "education" && (
        <EducationEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "certifications" && (
        <CertificationsEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "extras" && (
        <ExtrasEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "contact" && (
        <ContactEditor content={section.content} profile={profile} onProfileUpdate={onProfileUpdate} onChange={onChange} />
      )}
      {section.type === "social" && (
        <SocialSectionEditor content={section.content} profile={profile} onChange={onChange} />
      )}
      {section.type === "testimonials" && (
        <TestimonialsEditor content={section.content} onChange={onChange} />
      )}
    </div>
  );
}

// ─── Shared toggle row ────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-xs font-medium text-zinc-700">{label}</div>
        {description && <div className="text-[10px] text-zinc-400">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors overflow-hidden ${value ? "bg-green-500" : "bg-zinc-200"}`}
      >
        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── Formatted Textarea (with markdown toolbar) ───────────────────────────────

function FormattedTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(prefix: string) {
    const el = ref.current;
    const v = value ?? "";
    if (!el) {
      onChange(v + (v && !v.endsWith("\n") ? "\n" : "") + prefix);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = v.slice(0, start);
    const selected = v.slice(start, end);
    const after = v.slice(end);
    const needsNL = before.length > 0 && !before.endsWith("\n");
    const toInsert = (needsNL ? "\n" : "") + prefix + selected;
    const next = before + toInsert + after;
    onChange(next);
    setTimeout(() => {
      el.focus();
      const pos = start + toInsert.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  }

  return (
    <div>
      <div className="flex items-center gap-0.5 px-2 py-0.5 bg-zinc-50 border border-zinc-200 border-b-0 rounded-t-lg">
        <button type="button" onClick={() => insert("## ")} title="Section heading"
          className="px-2 py-0.5 text-[11px] font-bold text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 rounded transition-colors">H</button>
        <button type="button" onClick={() => insert("- ")} title="Bullet point"
          className="px-2 py-0.5 text-[12px] font-bold text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 rounded transition-colors">•</button>
        <button type="button" onClick={() => insert("\n")} title="New paragraph"
          className="px-2 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 rounded transition-colors">¶</button>
        <span className="ml-auto text-[9px] text-zinc-300 pr-1">markdown</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400 rounded-b-lg"
      />
    </div>
  );
}

// ─── About Editor ─────────────────────────────────────────────────────────────

function AboutEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Layout</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["left", "centered"] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => onChange({ layout })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                ((content.layout as string) ?? "left") === layout
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {layout === "left" ? "Left aligned" : "Centered"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Bio override</label>
        <FormattedTextarea
          value={(content.bioOverride as string) ?? ""}
          placeholder="Leave blank to use your profile bio"
          rows={4}
          onChange={(v) => onChange({ bioOverride: v || undefined })}
        />
        <p className="text-[10px] text-zinc-400">Use ## for headings, - for bullets</p>
      </div>
    </div>
  );
}

// ─── Skills Editor ────────────────────────────────────────────────────────────

function SkillsEditor({
  content,
  profile,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onChange: (c: Record<string, unknown>) => void;
}) {
  const displayStyle = (content.displayStyle as string) ?? "tags";
  const profileSkillsPlaceholder = parseArr(profile?.skills).slice(0, 4).join(", ") || "React, TypeScript, Node.js";
  const hasProfileSkills = parseArr(profile?.skills).length > 0 || parseArr(profile?.technologies).length > 0;

  return (
    <div className="space-y-3">
      {!hasProfileSkills && !(content.customSkills as string) && (
        <a href="/dashboard/profile" target="_blank"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700 hover:bg-amber-100 transition-colors">
          <span className="text-base">⚠</span>
          <span>No skills found. <span className="font-semibold underline">Add skills in Profile</span> to show them here.</span>
        </a>
      )}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Display style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(["tags", "grid", "list"] as const).map((style) => (
            <button
              key={style}
              onClick={() => onChange({ displayStyle: style })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                displayStyle === style
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Custom skills</label>
        <textarea
          value={(content.customSkills as string) ?? ""}
          placeholder={profileSkillsPlaceholder}
          rows={2}
          onChange={(e) => onChange({ customSkills: e.target.value || undefined })}
          className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400"
        />
        <p className="text-[10px] text-zinc-400">Comma separated. Leave blank to use profile skills.</p>
      </div>
    </div>
  );
}

// ─── Project Form (standalone to avoid re-mount on keystroke) ─────────────────

function ProjForm({ form, setForm, saving, onSave, onCancel }: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const cls = "w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400";
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const images = parseProjectImages(form.imageUrl);

  function syncImages(next: string[]) {
    setForm({ ...form, imageUrl: JSON.stringify(next) });
  }

  async function handleFileUpload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        uploaded.push(data.url);
      }
      syncImages([...images, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
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

  return (
    <div className="space-y-2 pt-2">
      <input type="text" value={form.title} placeholder="Project title *" onChange={(e) => setForm({ ...form, title: e.target.value })} className={cls} />
      <FormattedTextarea
        value={form.description}
        placeholder="Description — use ## for headings, - for bullets"
        rows={3}
        onChange={(v) => setForm({ ...form, description: v })}
      />

      {/* Multi-image picker */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-zinc-400">Project images (optional)</p>

        {/* Image grid */}
        {images.length > 0 && (
          <div className={`grid gap-1 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {images.map((url, i) => (
              <div key={i} className="relative group aspect-video rounded-md overflow-hidden border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => syncImages(images.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileUpload(Array.from(e.dataTransfer.files)); }}
          className="border-2 border-dashed border-zinc-200 rounded-md h-12 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-zinc-400 transition-colors">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(Array.from(e.target.files ?? []))} />
          {uploading ? (
            <span className="text-[10px] text-zinc-500">Uploading…</span>
          ) : (
            <>
              <CloudArrowUp size={13} className="text-zinc-400" />
              <span className="text-[10px] text-zinc-400">Click or drag images (multiple allowed)</span>
            </>
          )}
        </div>

        {/* URL add */}
        <div className="flex gap-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="Paste image URL…"
            className={cls}
          />
          <button type="button" onClick={addUrl} className="px-2 h-7 text-[10px] bg-zinc-100 border border-zinc-200 rounded-md hover:bg-zinc-200 transition-colors flex-shrink-0">
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div><p className="text-[10px] text-zinc-400 mb-0.5">Start</p><input type="month" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
        <div><p className="text-[10px] text-zinc-400 mb-0.5">End</p><input type="month" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
      </div>
      <input type="text" value={form.liveUrl} placeholder="Live URL" onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className={cls} />
      <input type="text" value={form.githubUrl} placeholder="GitHub URL" onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className={cls} />
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} disabled={saving} className="flex-1 h-7 bg-zinc-950 text-white text-xs font-semibold rounded-lg disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} className="flex-1 h-7 border border-zinc-200 text-xs rounded-lg text-zinc-600 hover:bg-zinc-50">Cancel</button>
      </div>
    </div>
  );
}

// ─── Projects Editor ──────────────────────────────────────────────────────────

function ProjectsEditor({
  content,
  profile,
  onProfileUpdate,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const hiddenIds = (content.hiddenIds as string[]) ?? [];
  const maxItems = (content.maxItems as number) ?? 4;
  const layout = (content.layout as string) ?? "grid";
  const showImages = (content.showImages as boolean) ?? false;
  const projects = profile?.projects ?? [];

  const blankProj = { title: "", description: "", liveUrl: "", githubUrl: "", imageUrl: "", startDate: "", endDate: "" };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(blankProj);
  const [saving, setSaving] = useState(false);

  function toggleProject(id: string, visible: boolean) {
    const next = visible ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    onChange({ hiddenIds: next.length ? next : undefined });
  }

  function startEdit(p: Project) {
    setAddingNew(false);
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: (p.description as string) ?? "",
      liveUrl: (p.liveUrl as string) ?? "",
      githubUrl: (p.githubUrl as string) ?? "",
      imageUrl: (p.imageUrl as string) ?? "",
      startDate: (p as { startDate?: Date | null }).startDate ? new Date((p as { startDate: Date }).startDate).toISOString().slice(0, 7) : "",
      endDate: (p as { endDate?: Date | null }).endDate ? new Date((p as { endDate: Date }).endDate).toISOString().slice(0, 7) : "",
    });
  }

  async function handleSave() {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: form.endDate ? `${form.endDate}-01` : null,
      };
      if (editingId) {
        const { data } = await axios.patch(`/api/profile/project/${editingId}`, payload);
        onProfileUpdate((p) => p ? { ...p, projects: p.projects.map((pr) => pr.id === editingId ? data.data : pr) } : p);
        setEditingId(null);
        toast.success("Updated");
      } else {
        const { data } = await axios.post("/api/profile/project", payload);
        onProfileUpdate((p) => p ? { ...p, projects: [...p.projects, data.data] } : p);
        setAddingNew(false);
        toast.success("Added");
      }
      setForm(blankProj);
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/profile/project/${id}`);
      onProfileUpdate((p) => p ? { ...p, projects: p.projects.filter((pr) => pr.id !== id) } : p);
      const newHidden = hiddenIds.filter((x) => x !== id);
      onChange({ hiddenIds: newHidden.length ? newHidden : undefined });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Layout</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["grid", "list"] as const).map((l) => (
            <button key={l} onClick={() => onChange({ layout: l })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${layout === l ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
              {l === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Max shown</label>
        <div className="grid grid-cols-4 gap-1">
          {[2, 3, 4, 6].map((n) => (
            <button key={n} onClick={() => onChange({ maxItems: n })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${maxItems === n ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Show images toggle */}
      <label className="flex items-center justify-between cursor-pointer py-0.5">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Show project images</span>
        <div
          onClick={() => onChange({ showImages: !showImages })}
          className={`relative w-11 h-6 rounded-full overflow-hidden transition-colors ${showImages ? "bg-green-500" : "bg-zinc-200"}`}>
          <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${showImages ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </label>

      {/* Profile projects — full CRUD */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Profile projects</label>
        {projects.map((proj) => (
          <div key={proj.id} className="rounded-lg border border-zinc-200 overflow-hidden">
            {editingId === proj.id ? (
              <div className="p-2.5 bg-zinc-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Editing</span>
                  <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-zinc-700"><X size={12} /></button>
                </div>
                <ProjForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setEditingId(null)} />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-2">
                <input type="checkbox" checked={!hiddenIds.includes(proj.id)} onChange={(e) => toggleProject(proj.id, e.target.checked)} className="rounded accent-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-700 truncate">{proj.title}</div>
                </div>
                <button onClick={() => startEdit(proj)} className="text-zinc-400 hover:text-zinc-700 p-0.5 flex-shrink-0"><PencilSimple size={12} /></button>
                <button onClick={() => handleDelete(proj.id)} className="text-zinc-400 hover:text-red-500 p-0.5 flex-shrink-0"><Trash size={12} /></button>
              </div>
            )}
          </div>
        ))}
        {addingNew ? (
          <div className="rounded-lg border border-zinc-300 p-2.5 bg-zinc-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">New project</span>
              <button onClick={() => setAddingNew(false)} className="text-zinc-400 hover:text-zinc-700"><X size={12} /></button>
            </div>
            <ProjForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setAddingNew(false)} />
          </div>
        ) : (
          <button onClick={() => { setEditingId(null); setAddingNew(true); setForm(blankProj); }}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all">
            <Plus size={12} /> Add project
          </button>
        )}
      </div>

    </div>
  );
}

// ─── Experience Editor ────────────────────────────────────────────────────────

// ─── Shared compact form fields ───────────────────────────────────────────────

function ExpForm({ form, setForm, saving, onSave, onCancel }: {
  form: Record<string, string | boolean>;
  setForm: (f: Record<string, string | boolean>) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const cls = "w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400";
  return (
    <div className="space-y-2 pt-2">
      <input type="text" value={form.title as string} placeholder="Job title *" onChange={(e) => setForm({ ...form, title: e.target.value })} className={cls} />
      <input type="text" value={form.company as string} placeholder="Company *" onChange={(e) => setForm({ ...form, company: e.target.value })} className={cls} />
      <input type="text" value={form.location as string} placeholder="Location" onChange={(e) => setForm({ ...form, location: e.target.value })} className={cls} />
      <FormattedTextarea
        value={form.description as string}
        placeholder="Description — use ## for headings, - for bullets"
        rows={3}
        onChange={(v) => setForm({ ...form, description: v })}
      />
      <div className="grid grid-cols-2 gap-1.5">
        <div><p className="text-[10px] text-zinc-400 mb-0.5">Start</p><input type="month" value={form.startDate as string} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
        <div><p className="text-[10px] text-zinc-400 mb-0.5">End</p><input type="month" value={form.endDate as string} disabled={form.isCurrent as boolean} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400 disabled:opacity-40" /></div>
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
        <input type="checkbox" checked={form.isCurrent as boolean} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked, endDate: e.target.checked ? "" : form.endDate as string })} className="rounded accent-green-500" />
        Currently working here
      </label>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} disabled={saving} className="flex-1 h-7 bg-zinc-950 text-white text-xs font-semibold rounded-lg disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} className="flex-1 h-7 border border-zinc-200 text-xs rounded-lg text-zinc-600 hover:bg-zinc-50">Cancel</button>
      </div>
    </div>
  );
}

// ─── Experience Editor ────────────────────────────────────────────────────────

function ExperienceEditor({
  content,
  profile,
  onProfileUpdate,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const hiddenIds = (content.hiddenIds as string[]) ?? [];
  const maxItems = (content.maxItems as number) ?? 5;
  const experiences = profile?.experiences ?? [];

  const blankForm = { title: "", company: "", location: "", description: "", startDate: "", endDate: "", isCurrent: false };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>(blankForm);
  const [saving, setSaving] = useState(false);

  function toggleExp(id: string, visible: boolean) {
    const next = visible ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    onChange({ hiddenIds: next.length ? next : undefined });
  }

  function startEdit(exp: Experience) {
    setAddingNew(false);
    setEditingId(exp.id);
    setForm({
      title: exp.title, company: exp.company, location: exp.location ?? "",
      description: (exp.description as string) ?? "",
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : "",
      isCurrent: exp.isCurrent,
    });
  }

  async function handleSave() {
    if (!form.title || !form.company) { toast.error("Title and company are required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, startDate: form.startDate ? `${form.startDate}-01` : undefined, endDate: form.endDate ? `${form.endDate}-01` : undefined };
      if (editingId) {
        const { data } = await axios.patch(`/api/profile/experience/${editingId}`, payload);
        onProfileUpdate((p) => p ? { ...p, experiences: p.experiences.map((e) => e.id === editingId ? data.data : e) } : p);
        setEditingId(null);
        toast.success("Updated");
      } else {
        const { data } = await axios.post("/api/profile/experience", payload);
        onProfileUpdate((p) => p ? { ...p, experiences: [...p.experiences, data.data] } : p);
        setAddingNew(false);
        toast.success("Added");
      }
      setForm(blankForm);
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/profile/experience/${id}`);
      onProfileUpdate((p) => p ? { ...p, experiences: p.experiences.filter((e) => e.id !== id) } : p);
      const newHidden = hiddenIds.filter((x) => x !== id);
      onChange({ hiddenIds: newHidden.length ? newHidden : undefined });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Max entries shown</label>
        <div className="grid grid-cols-4 gap-1">
          {[2, 3, 5, 10].map((n) => (
            <button key={n} onClick={() => onChange({ maxItems: n })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${maxItems === n ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Profile entries — full CRUD */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Profile entries</label>
        {experiences.map((exp) => (
          <div key={exp.id} className="rounded-lg border border-zinc-200 overflow-hidden">
            {editingId === exp.id ? (
              <div className="p-2.5 bg-zinc-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Editing</span>
                  <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-zinc-700"><X size={12} /></button>
                </div>
                <ExpForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setEditingId(null)} />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-2">
                <input type="checkbox" checked={!hiddenIds.includes(exp.id)} onChange={(e) => toggleExp(exp.id, e.target.checked)} className="rounded accent-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-700 truncate">{exp.title}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{exp.company}</div>
                </div>
                <button onClick={() => startEdit(exp)} className="text-zinc-400 hover:text-zinc-700 p-0.5 flex-shrink-0"><PencilSimple size={12} /></button>
                <button onClick={() => handleDelete(exp.id)} className="text-zinc-400 hover:text-red-500 p-0.5 flex-shrink-0"><Trash size={12} /></button>
              </div>
            )}
          </div>
        ))}
        {addingNew ? (
          <div className="rounded-lg border border-zinc-300 p-2.5 bg-zinc-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">New experience</span>
              <button onClick={() => setAddingNew(false)} className="text-zinc-400 hover:text-zinc-700"><X size={12} /></button>
            </div>
            <ExpForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setAddingNew(false)} />
          </div>
        ) : (
          <button onClick={() => { setEditingId(null); setAddingNew(true); setForm(blankForm); }}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all">
            <Plus size={12} /> Add experience
          </button>
        )}
      </div>

    </div>
  );
}

// ─── Education Editor ─────────────────────────────────────────────────────────

const blankEdu = { institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" };

function EducationEditor({
  content,
  profile,
  onProfileUpdate,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const hiddenIds = (content.hiddenIds as string[]) ?? [];
  const education = profile?.education ?? [];
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [addingNew, setAddingNew] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>(blankEdu);
  const [saving, setSaving] = React.useState(false);

  function toggleEdu(id: string, visible: boolean) {
    const next = visible ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    onChange({ hiddenIds: next.length ? next : undefined });
  }

  function startEdit(e: typeof education[0]) {
    setEditingId(e.id);
    setAddingNew(false);
    setForm({
      institution: e.institution ?? "",
      degree: e.degree ?? "",
      field: e.field ?? "",
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : "",
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 7) : "",
      gpa: e.gpa ?? "",
      description: e.description ?? "",
    });
  }

  function startAdd() {
    setAddingNew(true);
    setEditingId(null);
    setForm(blankEdu);
  }

  function cancelForm() {
    setEditingId(null);
    setAddingNew(false);
    setForm(blankEdu);
  }

  async function handleSave() {
    if (!form.institution || !form.startDate) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? `${form.startDate}-01` : undefined,
        endDate: form.endDate ? `${form.endDate}-01` : null,
      };
      if (editingId) {
        const { data } = await axios.patch(`/api/profile/education/${editingId}`, payload);
        onProfileUpdate((p) => p ? { ...p, education: p.education.map((e) => e.id === editingId ? data.data : e) } : p);
      } else {
        const { data } = await axios.post("/api/profile/education", payload);
        onProfileUpdate((p) => p ? { ...p, education: [...p.education, data.data] } : p);
      }
      cancelForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/profile/education/${id}`);
      onProfileUpdate((p) => p ? { ...p, education: p.education.filter((e) => e.id !== id) } : p);
    } catch (err) {
      console.error(err);
    }
  }

  const inputCls = "w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Profile education</label>
        {education.length === 0 && !addingNew && (
          <p className="text-[10px] text-zinc-400">No education yet. Add one below.</p>
        )}
        {education.map((e) => (
          <div key={e.id} className="rounded-lg border border-zinc-200 overflow-hidden">
            <div className="flex items-center gap-2 px-2.5 py-2">
              <input type="checkbox" checked={!hiddenIds.includes(e.id)} onChange={(ev) => toggleEdu(e.id, ev.target.checked)} className="rounded accent-green-500 shrink-0" />
              <span className="flex-1 text-xs text-zinc-700 truncate">{e.degree || e.field ? `${e.degree ?? ""}${e.degree && e.field ? " — " : ""}${e.field ?? ""}` : e.institution}</span>
              <button onClick={() => startEdit(e)} className="text-zinc-400 hover:text-zinc-700 transition-colors p-0.5"><PencilSimple size={11} /></button>
              <button onClick={() => handleDelete(e.id)} className="text-zinc-400 hover:text-red-400 transition-colors p-0.5"><Trash size={11} /></button>
            </div>
            {editingId === e.id && (
              <div className="border-t border-zinc-100 bg-zinc-50 p-2.5 space-y-1.5">
                <input type="text" value={form.institution} placeholder="Institution *" onChange={(ev) => setForm({ ...form, institution: ev.target.value })} className={inputCls} />
                <div className="grid grid-cols-2 gap-1.5">
                  <input type="text" value={form.degree} placeholder="Degree" onChange={(ev) => setForm({ ...form, degree: ev.target.value })} className={inputCls} />
                  <input type="text" value={form.field} placeholder="Field of study" onChange={(ev) => setForm({ ...form, field: ev.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><p className="text-[10px] text-zinc-400 mb-0.5">Start *</p><input type="month" value={form.startDate} onChange={(ev) => setForm({ ...form, startDate: ev.target.value })} className={inputCls} /></div>
                  <div><p className="text-[10px] text-zinc-400 mb-0.5">End</p><input type="month" value={form.endDate} onChange={(ev) => setForm({ ...form, endDate: ev.target.value })} className={inputCls} /></div>
                </div>
                <input type="text" value={form.gpa} placeholder="GPA (optional)" onChange={(ev) => setForm({ ...form, gpa: ev.target.value })} className={inputCls} />
                <textarea value={form.description} placeholder="Description" rows={3} onChange={(ev) => setForm({ ...form, description: ev.target.value })} className="w-full px-2 py-1.5 rounded-md border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400" />
                <div className="flex gap-1.5 pt-0.5">
                  <button onClick={handleSave} disabled={saving || !form.institution || !form.startDate} className="flex-1 h-7 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">{saving ? "Saving…" : "Save"}</button>
                  <button onClick={cancelForm} className="flex-1 h-7 rounded-md border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {addingNew && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">New education</p>
            <input type="text" value={form.institution} placeholder="Institution *" onChange={(ev) => setForm({ ...form, institution: ev.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-1.5">
              <input type="text" value={form.degree} placeholder="Degree" onChange={(ev) => setForm({ ...form, degree: ev.target.value })} className={inputCls} />
              <input type="text" value={form.field} placeholder="Field of study" onChange={(ev) => setForm({ ...form, field: ev.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div><p className="text-[10px] text-zinc-400 mb-0.5">Start *</p><input type="month" value={form.startDate} onChange={(ev) => setForm({ ...form, startDate: ev.target.value })} className={inputCls} /></div>
              <div><p className="text-[10px] text-zinc-400 mb-0.5">End</p><input type="month" value={form.endDate} onChange={(ev) => setForm({ ...form, endDate: ev.target.value })} className={inputCls} /></div>
            </div>
            <input type="text" value={form.gpa} placeholder="GPA (optional)" onChange={(ev) => setForm({ ...form, gpa: ev.target.value })} className={inputCls} />
            <textarea value={form.description} placeholder="Description" rows={3} onChange={(ev) => setForm({ ...form, description: ev.target.value })} className="w-full px-2 py-1.5 rounded-md border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400" />
            <div className="flex gap-1.5 pt-0.5">
              <button onClick={handleSave} disabled={saving || !form.institution || !form.startDate} className="flex-1 h-7 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">{saving ? "Saving…" : "Save"}</button>
              <button onClick={cancelForm} className="flex-1 h-7 rounded-md border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
            </div>
          </div>
        )}
        {!addingNew && (
          <button onClick={startAdd} className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all">
            <Plus size={12} /> Add education
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Cert Form (standalone) ───────────────────────────────────────────────────

function CertForm({ form, setForm, saving, onSave, onCancel }: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const cls = "w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400";
  return (
    <div className="space-y-1.5 pt-1.5">
      <input type="text" value={form.name} placeholder="Certification name *" onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} />
      <input type="text" value={form.issuer} placeholder="Issuing organization" onChange={(e) => setForm({ ...form, issuer: e.target.value })} className={cls} />
      <div className="grid grid-cols-2 gap-1.5">
        <div><p className="text-[10px] text-zinc-400 mb-0.5">Issue date</p><input type="month" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
        <div><p className="text-[10px] text-zinc-400 mb-0.5">Expiry</p><input type="month" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
      </div>
      <input type="text" value={form.credentialId} placeholder="Credential ID (optional)" onChange={(e) => setForm({ ...form, credentialId: e.target.value })} className={cls} />
      <input type="text" value={form.credentialUrl} placeholder="Credential URL (optional)" onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} className={cls} />
      <div className="flex gap-1.5 pt-0.5">
        <button onClick={onSave} disabled={saving || !form.name} className="flex-1 h-7 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} className="flex-1 h-7 rounded-md border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Extra Form (standalone) ──────────────────────────────────────────────────

function ExtraForm({ form, setForm, saving, onSave, onCancel }: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const cls = "w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400";
  return (
    <div className="space-y-1.5 pt-1.5">
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cls}>
        {EXTRA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input type="text" value={form.title} placeholder="Title *" onChange={(e) => setForm({ ...form, title: e.target.value })} className={cls} />
      <input type="text" value={form.subtitle} placeholder="Subtitle / level / organization" onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={cls} />
      <textarea value={form.description} placeholder="Description (optional)" rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-2 py-1.5 rounded-md border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400" />
      <div className="grid grid-cols-2 gap-1.5">
        <div><p className="text-[10px] text-zinc-400 mb-0.5">Date</p><input type="month" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-7 px-1.5 rounded-md border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400" /></div>
        <input type="text" value={form.url} placeholder="URL (optional)" onChange={(e) => setForm({ ...form, url: e.target.value })} className={`${cls} mt-4`} />
      </div>
      <div className="flex gap-1.5 pt-0.5">
        <button onClick={onSave} disabled={saving || !form.title} className="flex-1 h-7 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} className="flex-1 h-7 rounded-md border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Certifications Editor ────────────────────────────────────────────────────

const blankCert = { name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" };

function CertificationsEditor({
  content, profile, onProfileUpdate, onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const hiddenIds = (content.hiddenIds as string[]) ?? [];
  const certs = profile?.certifications ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(blankCert);
  const [saving, setSaving] = useState(false);

  function toggleCert(id: string, visible: boolean) {
    const next = visible ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    onChange({ hiddenIds: next.length ? next : undefined });
  }

  function startEdit(c: Certification) {
    setEditingId(c.id); setAddingNew(false);
    setForm({ name: c.name, issuer: c.issuer ?? "", issueDate: c.issueDate ? new Date(c.issueDate).toISOString().slice(0, 7) : "", expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 7) : "", credentialId: c.credentialId ?? "", credentialUrl: c.credentialUrl ?? "" });
  }

  function cancelForm() { setEditingId(null); setAddingNew(false); setForm(blankCert); }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload = { ...form, issueDate: form.issueDate ? `${form.issueDate}-01` : null, expiryDate: form.expiryDate ? `${form.expiryDate}-01` : null };
      if (editingId) {
        const { data } = await axios.patch(`/api/profile/certification/${editingId}`, payload);
        onProfileUpdate((p) => p ? { ...p, certifications: p.certifications.map((c) => c.id === editingId ? data.data : c) } : p);
      } else {
        const { data } = await axios.post("/api/profile/certification", payload);
        onProfileUpdate((p) => p ? { ...p, certifications: [...p.certifications, data.data] } : p);
      }
      cancelForm();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/profile/certification/${id}`);
      onProfileUpdate((p) => p ? { ...p, certifications: p.certifications.filter((c) => c.id !== id) } : p);
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Profile certifications</label>
      {certs.length === 0 && !addingNew && <p className="text-[10px] text-zinc-400">No certifications yet. Add one below.</p>}
      {certs.map((c) => (
        <div key={c.id} className="rounded-lg border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <input type="checkbox" checked={!hiddenIds.includes(c.id)} onChange={(ev) => toggleCert(c.id, ev.target.checked)} className="rounded accent-green-500 shrink-0" />
            <span className="flex-1 text-xs text-zinc-700 truncate">{c.name}</span>
            <button onClick={() => startEdit(c)} className="text-zinc-400 hover:text-zinc-700 p-0.5"><PencilSimple size={11} /></button>
            <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-400 p-0.5"><Trash size={11} /></button>
          </div>
          {editingId === c.id && <div className="border-t border-zinc-100 bg-zinc-50 p-2.5"><CertForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancelForm} /></div>}
        </div>
      ))}
      {addingNew && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">New certification</p>
          <CertForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancelForm} />
        </div>
      )}
      {!addingNew && (
        <button onClick={() => { setAddingNew(true); setEditingId(null); setForm(blankCert); }} className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all">
          <Plus size={12} /> Add certification
        </button>
      )}
    </div>
  );
}

// ─── Extras Editor ────────────────────────────────────────────────────────────

const EXTRA_CATEGORIES = ["Award", "Language", "Publication", "Volunteer", "Patent", "Speaking", "Other"];
const blankExtra = { title: "", category: "Other", subtitle: "", description: "", date: "", url: "" };

function ExtrasEditor({
  content, profile, onProfileUpdate, onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const hiddenIds = (content.hiddenIds as string[]) ?? [];
  const extras = profile?.extras ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(blankExtra);
  const [saving, setSaving] = useState(false);

  function toggleExtra(id: string, visible: boolean) {
    const next = visible ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
    onChange({ hiddenIds: next.length ? next : undefined });
  }

  function startEdit(e: import("@prisma/client").Extra) {
    setEditingId(e.id); setAddingNew(false);
    setForm({ title: e.title, category: e.category, subtitle: e.subtitle ?? "", description: e.description ?? "", date: e.date ? new Date(e.date).toISOString().slice(0, 7) : "", url: e.url ?? "" });
  }

  function cancelForm() { setEditingId(null); setAddingNew(false); setForm(blankExtra); }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, date: form.date ? `${form.date}-01` : null };
      if (editingId) {
        const { data } = await axios.patch(`/api/profile/extras/${editingId}`, payload);
        onProfileUpdate((p) => p ? { ...p, extras: p.extras.map((e) => e.id === editingId ? data.data : e) } : p);
      } else {
        const { data } = await axios.post("/api/profile/extras", payload);
        onProfileUpdate((p) => p ? { ...p, extras: [...p.extras, data.data] } : p);
      }
      cancelForm();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/profile/extras/${id}`);
      onProfileUpdate((p) => p ? { ...p, extras: p.extras.filter((e) => e.id !== id) } : p);
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Profile extras</label>
      <p className="text-[10px] text-zinc-400 -mt-1">Awards, languages, publications, volunteer work, etc.</p>
      {extras.length === 0 && !addingNew && <p className="text-[10px] text-zinc-400">No extras yet. Add one below.</p>}
      {extras.map((e) => (
        <div key={e.id} className="rounded-lg border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <input type="checkbox" checked={!hiddenIds.includes(e.id)} onChange={(ev) => toggleExtra(e.id, ev.target.checked)} className="rounded accent-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-zinc-700 truncate block">{e.title}</span>
              <span className="text-[10px] text-zinc-400">{e.category}</span>
            </div>
            <button onClick={() => startEdit(e)} className="text-zinc-400 hover:text-zinc-700 p-0.5"><PencilSimple size={11} /></button>
            <button onClick={() => handleDelete(e.id)} className="text-zinc-400 hover:text-red-400 p-0.5"><Trash size={11} /></button>
          </div>
          {editingId === e.id && <div className="border-t border-zinc-100 bg-zinc-50 p-2.5"><ExtraForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancelForm} /></div>}
        </div>
      ))}
      {addingNew && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">New extra</p>
          <ExtraForm form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={cancelForm} />
        </div>
      )}
      {!addingNew && (
        <button onClick={() => { setAddingNew(true); setEditingId(null); setForm(blankExtra); }} className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all">
          <Plus size={12} /> Add extra
        </button>
      )}
    </div>
  );
}

// ─── Contact Editor ───────────────────────────────────────────────────────────

function ContactEditor({
  content,
  profile,
  onProfileUpdate,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onProfileUpdate: React.Dispatch<React.SetStateAction<BuilderProps["profile"]>>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [links, setLinks] = React.useState({
    linkedinUrl: profile?.linkedinUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    twitterUrl: profile?.twitterUrl ?? "",
    instagramUrl: (profile as any)?.instagramUrl ?? "",
    website: profile?.website ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  async function saveLinks() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: links.linkedinUrl || null,
          githubUrl: links.githubUrl || null,
          twitterUrl: links.twitterUrl || null,
          instagramUrl: links.instagramUrl || null,
          website: links.website || null,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        onProfileUpdate((prev) => prev ? { ...prev, ...data } : prev);
      }
    } finally {
      setSaving(false);
    }
  }

  const SOCIAL_FIELDS = [
    { key: "linkedinUrl" as const, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourname" },
    { key: "githubUrl" as const, label: "GitHub URL", placeholder: "https://github.com/yourname" },
    { key: "twitterUrl" as const, label: "Twitter / X URL", placeholder: "https://x.com/yourname" },
    { key: "instagramUrl" as const, label: "Instagram URL", placeholder: "https://instagram.com/yourname" },
    { key: "website" as const, label: "Website URL", placeholder: "https://yoursite.com" },
  ];

  return (
    <div className="space-y-3">
      <ToggleRow
        label="Contact form"
        description="Let visitors send you messages"
        value={(content.enableForm as boolean) ?? true}
        onChange={(v) => onChange({ enableForm: v })}
      />
      <ToggleRow
        label="Show email address"
        value={(content.showEmail as boolean) ?? true}
        onChange={(v) => onChange({ showEmail: v })}
      />
      <ToggleRow
        label="Show social links"
        value={(content.showSocials as boolean) ?? true}
        onChange={(v) => onChange({ showSocials: v })}
      />
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Social links</p>
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-0.5">
            <label className="text-[10px] text-zinc-400">{label}</label>
            <input
              type="url"
              value={links[key]}
              onChange={(e) => setLinks((l) => ({ ...l, [key]: e.target.value }))}
              onBlur={saveLinks}
              placeholder={placeholder}
              className="w-full h-7 px-2 rounded-lg border border-zinc-200 text-[11px] focus:outline-none focus:border-zinc-400"
            />
          </div>
        ))}
        {saving && <p className="text-[10px] text-zinc-400">Saving…</p>}
      </div>
    </div>
  );
}

// ─── Social Section Editor ────────────────────────────────────────────────────

function SocialSectionEditor({
  content,
  profile,
  onChange,
}: {
  content: Record<string, unknown>;
  profile: BuilderProps["profile"];
  onChange: (c: Record<string, unknown>) => void;
}) {
  const layout = (content.layout as string) ?? "grid";
  const showLabels = (content.showLabels as boolean) ?? true;
  const hasSocials = profile?.linkedinUrl || profile?.githubUrl || profile?.twitterUrl || (profile as any)?.instagramUrl || profile?.website;

  return (
    <div className="space-y-3">
      {!hasSocials && (
        <a href="/dashboard/profile" target="_blank"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700 hover:bg-amber-100 transition-colors">
          <span className="text-base">⚠</span>
          <span>No social links found. <span className="font-semibold underline">Add them in Profile → Social</span></span>
        </a>
      )}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Layout</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["grid", "list"] as const).map((l) => (
            <button key={l} onClick={() => onChange({ layout: l })}
              className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${layout === l ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ToggleRow label="Show labels" description="Show platform name below icon" value={showLabels} onChange={(v) => onChange({ showLabels: v })} />
    </div>
  );
}

// ─── Testimonials Editor ──────────────────────────────────────────────────────

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
}

function TestimonialsEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const items: TestimonialItem[] = (content.items as TestimonialItem[]) ?? [];

  function updateItem(id: string, patch: Partial<TestimonialItem>) {
    onChange({ items: items.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function addItem() {
    onChange({ items: [...items, { id: `t-${Date.now()}`, name: "", role: "", text: "" }] });
  }

  function removeItem(id: string) {
    onChange({ items: items.filter((t) => t.id !== id) });
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-zinc-200 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">Testimonial</span>
            <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          </div>
          <input
            type="text"
            value={item.name}
            placeholder="Name"
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
            className="w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
          />
          <input
            type="text"
            value={item.role}
            placeholder="Role, Company"
            onChange={(e) => updateItem(item.id, { role: e.target.value })}
            className="w-full h-7 px-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400"
          />
          <textarea
            value={item.text}
            placeholder="Their testimonial..."
            rows={2}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            className="w-full px-2 py-1.5 rounded-md border border-zinc-200 text-xs resize-none focus:outline-none focus:border-zinc-400"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border-2 border-dashed border-zinc-200 text-xs font-medium text-zinc-400 hover:border-green-400 hover:text-green-600 transition-all"
      >
        <Plus size={12} /> Add testimonial
      </button>
    </div>
  );
}

// ─── Auto-playing video helper ────────────────────────────────────────────────

function AutoPlayVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const tryPlay = () => { video.play().catch(() => {}); };
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
      return () => video.removeEventListener("canplay", tryPlay);
    }
  }, [src]);
  return <video ref={ref} key={src} src={src} muted loop playsInline autoPlay className={className} />;
}

// ─── Hero Media Editor ────────────────────────────────────────────────────────

function HeroMediaEditor({
  content,
  onChange,
}: {
  content: HeroContent;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [urlInput, setUrlInput] = useState(content.mediaUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = content.mediaType === "image";
  const isVideo = content.mediaType === "video";
  const hasMedia = !!(content.mediaType && content.mediaType !== "none");
  const hasUrl = !!content.mediaUrl;

  async function handleFile(file: File) {
    const allowedImage = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    const allowedVideo = ["video/mp4", "video/webm", "video/ogg", "video/mov"];

    if (isImage && !allowedImage.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP or GIF image");
      return;
    }
    if (isVideo && !allowedVideo.includes(file.type)) {
      toast.error("Please select an MP4, WebM or OGG video");
      return;
    }

    // Size guard: 10 MB for images (base64 fallback), 100 MB for videos (Cloudinary only)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? "100 MB" : "10 MB"}.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Try Cloudinary first
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/upload", formData, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 90));
        },
      });

      if (res) {
        setUploadProgress(100);
        const url = res.data.url as string;
        onChange({ ...content, mediaUrl: url });
        setUrlInput(url);
        toast.success("Uploaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Try pasting a URL instead.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function clearMedia() {
    onChange({ ...content, mediaUrl: "" });
    setUrlInput("");
  }

  return (
    <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3 mt-2 space-y-3">
      <div className="flex items-center gap-1.5">
        <PencilSimple size={12} className="text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-700">Hero Media</span>
      </div>

      {/* Media type selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {(["none", "image", "video"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              onChange({ ...content, mediaType: t, mediaUrl: t === "none" ? "" : content.mediaUrl });
              if (t === "none") setUrlInput("");
            }}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-medium capitalize transition-all ${
              (content.mediaType ?? "none") === t
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300 bg-white"
            }`}
          >
            {t === "none" && <X size={13} />}
            {t === "image" && <ImageIcon size={13} />}
            {t === "video" && <Video size={13} />}
            {t}
          </button>
        ))}
      </div>

      {hasMedia && (
        <>
          {/* ── Upload / preview area ── */}
          {!hasUrl ? (
            /* Drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-5 ${
                dragOver
                  ? "border-green-400 bg-green-50"
                  : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50"
              } ${uploading ? "pointer-events-none" : ""}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 w-full px-4">
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">Uploading {uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <CloudArrowUp size={22} className="text-zinc-400" />
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-zinc-600">
                      Drop {isImage ? "image" : "video"} here or click to browse
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {isImage ? "JPG, PNG, WebP, GIF — max 10 MB" : "MP4, WebM — max 100 MB"}
                    </p>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={isImage ? "image/*" : "video/*"}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            /* Media preview */
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 group">
              {isImage && (
                <Image
                  src={content.mediaUrl!}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                  unoptimized={content.mediaUrl!.startsWith("data:")}
                />
              )}
              {isVideo && (
                <AutoPlayVideo src={content.mediaUrl!} className="w-full h-full object-cover" />
              )}
              {/* Action bar on hover */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 px-2 py-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[10px] text-white font-medium px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <CloudArrowUp size={10} /> Replace
                </button>
                <button
                  onClick={clearMedia}
                  className="flex items-center gap-1 text-[10px] text-white font-medium px-2 py-1 rounded-md bg-red-500/70 hover:bg-red-500 transition-colors"
                >
                  <Trash size={10} /> Remove
                </button>
              </div>
              {/* Hidden file input for replace */}
              <input
                ref={fileInputRef}
                type="file"
                accept={isImage ? "image/*" : "video/*"}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* URL paste fallback */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-zinc-500">
              Or paste a URL
            </label>
            <div className="flex gap-1.5">
              <input
                value={hasUrl && !content.mediaUrl?.startsWith("data:") ? content.mediaUrl : urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={() => { if (urlInput) { onChange({ ...content, mediaUrl: urlInput }); } }}
                onKeyDown={(e) => { if (e.key === "Enter" && urlInput) onChange({ ...content, mediaUrl: urlInput }); }}
                className="flex-1 h-8 px-2.5 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                placeholder={isImage ? "https://images.unsplash.com/..." : "https://.../video.mp4"}
              />
              {urlInput && urlInput !== content.mediaUrl && (
                <button
                  onClick={() => { onChange({ ...content, mediaUrl: urlInput }); }}
                  className="px-2.5 h-8 bg-zinc-950 text-white text-[10px] font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* Display mode */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-zinc-500">Display as</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["background", "featured"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...content, mediaMode: mode })}
                  className={`py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                    (content.mediaMode ?? "background") === mode
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300 bg-white"
                  }`}
                >
                  {mode === "background" ? "Full background" : "Side image"}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay opacity */}
          {(content.mediaMode ?? "background") === "background" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-zinc-500">Overlay darkness</label>
                <span className="text-[10px] text-zinc-400">{content.overlayOpacity ?? 40}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={content.overlayOpacity ?? 40}
                onChange={(e) => onChange({ ...content, overlayOpacity: Number(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>
          )}

          {isVideo && !hasUrl && (
            <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
              Video upload requires Cloudinary. Configure <code className="font-mono">CLOUDINARY_API_KEY</code> in your .env to enable.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sortable section item ─────────────────────────────────────────────────

function SortableSectionItem({
  section, isSelected, onSelect, onToggleVisible, onRemove,
}: {
  section: SectionConfig;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
        isSelected ? "border-green-500 bg-green-50" : "border-zinc-100 bg-white hover:border-zinc-200 hover:bg-zinc-50"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <DotsSixVertical size={14} />
      </button>
      <span className="flex-1 text-xs font-medium text-zinc-700">{section.title}</span>
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); onToggleVisible(); }} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors">
          {section.visible ? <Eye size={13} className="text-zinc-400" /> : <EyeSlash size={13} className="text-zinc-300" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
          <Trash size={13} className="text-zinc-300 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Portfolio preview ──────────────────────────────────────────────────────

function PortfolioPreview({ sections, config, profile, user }: {
  sections: SectionConfig[];
  config: PortfolioConfig;
  profile: BuilderProps["profile"];
  user: BuilderProps["user"];
}) {
  const visibleSections = sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const bgStyle = config.backgroundStyle ?? "solid";
  const isImageBg = bgStyle === "image";
  const isMeteors = bgStyle === "meteors" || isImageBg;
  const overlayOpacity = (config.backgroundImageOverlay ?? 40) / 100;
  const zoomMap = { sm: 0.875, md: 1, lg: 1.125, xl: 1.25 };
  const zoom = zoomMap[config.fontSize ?? "md"];
  const radiusMap = { sm: "4px", md: "16px", lg: "28px" };
  const cardRadius = radiusMap[config.borderRadius as keyof typeof radiusMap] ?? "16px";
  const fontEntry = FONT_MAP[config.fontFamily ?? "geist"] ?? FONT_MAP.geist;

  return (
    <>
      {fontEntry.url && (
        <style dangerouslySetInnerHTML={{ __html: `@import url("${fontEntry.url}");` }} />
      )}
    <div
      className="relative"
      style={{
        backgroundColor: isMeteors ? "#09090b" : isImageBg ? "#09090b" : config.backgroundColor,
        fontFamily: fontEntry.family,
        zoom,
        ["--cr" as string]: cardRadius,
      } as React.CSSProperties}
    >
      {/* Background image */}
      {isImageBg && config.backgroundImageUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        </div>
      )}
      {/* Background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: "100%" }}>
        {bgStyle === "grid" && <GridBackground color={config.primaryColor} />}
        {bgStyle === "dots" && <DotBackground color={config.primaryColor} />}
        {bgStyle === "aurora" && <AuroraBackground color={config.primaryColor} />}
        {bgStyle === "meteors" && <Meteors color={config.primaryColor} count={8} />}
      </div>
      <div className="relative z-10">
        {visibleSections.map((section) => (
          <div key={section.id} id={`preview-${section.id}`}>
            <PreviewSection section={section} config={config} profile={profile} user={user} isMeteors={isMeteors || isImageBg} />
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

function PreviewSection({ section, config, profile, user, isMeteors }: {
  section: SectionConfig;
  config: PortfolioConfig;
  profile: BuilderProps["profile"];
  user: BuilderProps["user"];
  isMeteors: boolean;
}) {
  const accent = config.primaryColor;
  const textColor = isMeteors ? "#fafafa" : config.textColor;
  const borderColor = isMeteors ? "border-white/10" : "border-zinc-100";
  const subTextColor = isMeteors ? "rgba(255,255,255,0.55)" : (config.secondaryTextColor ?? `${config.textColor}99`);
  const sectionTitle = (section.content.titleOverride as string) || section.title;

  // ── Hero ──────────────────────────────────────────────────────────────────
  if (section.type === "hero") {
    const heroContent = section.content as HeroContent;
    const hasMedia = heroContent.mediaUrl && heroContent.mediaType && heroContent.mediaType !== "none";
    const isBackground = (heroContent.mediaMode ?? "background") === "background";
    const isFeatured = heroContent.mediaMode === "featured";
    const overlayOpacity = (heroContent.overlayOpacity ?? 40) / 100;

    return (
      <div className={`min-h-[60vh] relative overflow-hidden border-b ${borderColor}`}>
        {hasMedia && isBackground && (
          <div className="absolute inset-0 z-0">
            {heroContent.mediaType === "image" ? (
              <Image src={heroContent.mediaUrl!} alt="" fill className="object-cover" />
            ) : (
              <AutoPlayVideo src={heroContent.mediaUrl!} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
          </div>
        )}
        <div className={`relative z-10 flex items-center px-10 py-16 ${isFeatured && hasMedia ? "gap-10" : ""}`}>
          <div className="flex-1">
            <div className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: accent }}>
              {profile?.openToWork ? "Available for work" : "Portfolio"}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: hasMedia && isBackground ? "#ffffff" : textColor }}>
              {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ""}`.trim() : user.name ?? "Your Name"}
            </h1>
            <p className="text-lg mb-6" style={{ color: hasMedia && isBackground ? "rgba(255,255,255,0.7)" : subTextColor }}>
              {profile?.headline ?? "Software Engineer · Designer · Creator"}
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: accent }}>View projects</button>
              <button className={`px-5 py-2 text-sm font-medium rounded-lg ${hasMedia && isBackground ? "border border-white/30 text-white" : "border border-zinc-200 text-zinc-700"}`}>
                Contact me
              </button>
            </div>
          </div>
          {hasMedia && isFeatured && (
            <div className="w-52 h-64 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
              {heroContent.mediaType === "image" ? (
                <Image src={heroContent.mediaUrl!} alt="" fill className="object-cover" />
              ) : (
                <AutoPlayVideo src={heroContent.mediaUrl!} className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── About ─────────────────────────────────────────────────────────────────
  if (section.type === "about") {
    const layout = (section.content.layout as string) ?? "left";
    const bio = (section.content.bioOverride as string) || profile?.bio || "I'm a passionate developer who loves building great products. Add your bio in Profile → Basic Info.";
    return (
      <div className={`px-10 py-12 border-b ${borderColor} ${layout === "centered" ? "text-center" : ""}`}>
        <h2 className="text-xl font-bold tracking-tight mb-4" style={{ color: textColor }}>{sectionTitle}</h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: subTextColor }}>{bio}</p>
      </div>
    );
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if (section.type === "skills") {
    const displayStyle = (section.content.displayStyle as string) ?? "tags";
    const rawCustom = (section.content.customSkills as string) ?? "";
    const skills = rawCustom
      ? rawCustom.split(",").map((s) => s.trim()).filter(Boolean)
      : parseArr(profile?.skills);
    const fallback = ["React", "TypeScript", "Node.js", "Design"];
    const usingFallback = skills.length === 0;
    const displaySkills = usingFallback ? fallback : skills;

    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {usingFallback && (
          <div className="mb-4 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700">
            Showing example skills. Go to <a href="/dashboard/profile" target="_blank" className="font-semibold underline">Profile → Skills tab</a> to add your real skills.
          </div>
        )}
        {displayStyle === "tags" && (
          <div className="flex flex-wrap gap-2">
            {displaySkills.map((skill) => (
              <span key={skill} className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {skill}
              </span>
            ))}
          </div>
        )}
        {displayStyle === "grid" && (
          <div className="grid grid-cols-3 gap-2">
            {displaySkills.map((skill) => (
              <div key={skill} className={`px-3 py-2 rounded-lg border text-xs font-medium text-center ${borderColor}`} style={{ color: textColor }}>
                {skill}
              </div>
            ))}
          </div>
        )}
        {displayStyle === "list" && (
          <div className="space-y-2">
            {displaySkills.map((skill) => (
              <div key={skill} className="flex items-center gap-2.5 text-sm" style={{ color: textColor }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (section.type === "projects") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const maxItems = (section.content.maxItems as number) ?? 4;
    const layout = (section.content.layout as string) ?? "grid";
    const showImages = (section.content.showImages as boolean) ?? false;
    const allProjects = profile?.projects ?? [];

    type ProjItem = { id: string; title: string; description?: string | null; imageUrl?: string | null; startDate?: Date | null; endDate?: Date | null };
    const merged: ProjItem[] = allProjects
      .filter((p) => !hiddenIds.includes(p.id))
      .map((p) => ({ id: p.id, title: p.title, description: p.description, imageUrl: (p as { imageUrl?: string | null }).imageUrl, startDate: (p as { startDate?: Date | null }).startDate, endDate: (p as { endDate?: Date | null }).endDate }))
      .slice(0, maxItems);

    const fmtPeriod = (start?: Date | null, end?: Date | null) => {
      if (!start && !end) return null;
      const fmt = (d: Date) => { const dt = new Date(d); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getUTCMonth()]} ${dt.getUTCFullYear()}`; };
      return `${start ? fmt(start) : ""} – ${end ? fmt(end) : "Present"}`;
    };

    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {layout === "grid" ? (
          <div className="grid grid-cols-2 gap-4">
            {merged.map((project) => {
              const imgs = parseProjectImages(project.imageUrl);
              return (
                <div key={project.id} className={`border overflow-hidden ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                  {imgs.length > 1 ? (
                    <div className={`grid grid-cols-3 gap-0.5 p-0.5 ${isMeteors ? "bg-white/5" : "bg-zinc-50"}`}>
                      {imgs.slice(0, 3).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`${project.title} ${i + 1}`} className="w-full aspect-square object-cover rounded-sm" />
                      ))}
                    </div>
                  ) : imgs.length === 1 ? (
                    <div className={`aspect-video overflow-hidden ${isMeteors ? "bg-white/5" : "bg-zinc-50"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgs[0]} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  ) : showImages ? (
                    <div className={`aspect-video flex items-center justify-center ${isMeteors ? "bg-white/5" : "bg-zinc-50"}`}>
                      <span className="text-[10px]" style={{ color: subTextColor }}>No image</span>
                    </div>
                  ) : null}
                  <div className="p-3">
                    <div className="font-medium text-sm" style={{ color: textColor }}>{project.title}</div>
                    {project.description && (
                      <div className="text-xs mt-0.5 space-y-0.5" style={{ color: subTextColor }}>
                        {project.description.split("\n").filter(Boolean).map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    )}
                    {fmtPeriod(project.startDate, project.endDate) && (
                      <div className="text-[10px] mt-1" style={{ color: accent }}>{fmtPeriod(project.startDate, project.endDate)}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {merged.length === 0 && ["Project 1", "Project 2"].map((p) => (
              <div key={p} className={`border overflow-hidden ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                {showImages && <div className={`aspect-video ${isMeteors ? "bg-white/5" : "bg-zinc-100"}`} />}
                <div className="p-3 space-y-1.5">
                  <div className={`h-3 w-20 rounded-full ${isMeteors ? "bg-white/10" : "bg-zinc-200"}`} />
                  <div className={`h-2 w-28 rounded-full ${isMeteors ? "bg-white/5" : "bg-zinc-100"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {merged.map((project) => {
              const imgs = parseProjectImages(project.imageUrl);
              return (
                <div key={project.id} className={`border overflow-hidden ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                  {imgs.length > 0 && (
                    <div className={`grid gap-0.5 p-0.5 ${imgs.length === 1 ? "grid-cols-1" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-3"} ${isMeteors ? "bg-white/5" : "bg-zinc-50"}`}>
                      {imgs.slice(0, 3).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`${project.title} ${i + 1}`} className={`w-full object-cover rounded-sm ${imgs.length === 1 ? "aspect-video" : "aspect-square"}`} />
                      ))}
                    </div>
                  )}
                  <div className="p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: textColor }}>{project.title}</div>
                      {project.description && (
                        <div className="text-xs mt-0.5 space-y-0.5" style={{ color: subTextColor }}>
                          {project.description.split("\n").filter(Boolean).map((line, i) => <div key={i}>{line}</div>)}
                        </div>
                      )}
                      {fmtPeriod(project.startDate, project.endDate) && (
                        <div className="text-[10px] mt-1" style={{ color: accent }}>{fmtPeriod(project.startDate, project.endDate)}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {merged.length === 0 && (
              <div className={`p-4 rounded-xl border ${borderColor} text-xs`} style={{ color: subTextColor }}>
                Add projects in your Profile to display them here.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (section.type === "experience") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const maxItems = (section.content.maxItems as number) ?? 5;
    type ExpItem = { id: string; title: string; company: string; location?: string | null; description?: string | null; startDate: Date | string | null; endDate?: Date | string | null; isCurrent: boolean };
    const merged: ExpItem[] = (profile?.experiences ?? [])
      .filter((e) => !hiddenIds.includes(e.id))
      .map((e) => ({ id: e.id, title: e.title, company: e.company, location: e.location, description: e.description, startDate: e.startDate, endDate: e.endDate, isCurrent: e.isCurrent }))
      .slice(0, maxItems);

    const fmtExpDate = (d: Date | string | null | undefined) => {
      if (!d) return "";
      const dt = typeof d === "string" ? new Date(d) : d;
      if (isNaN(dt.getTime())) {
        const [y, m] = (d as string).split("-");
        return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m)-1] ?? ""} ${y}`;
      }
      return `${dt.toLocaleString("default", { month: "short" })} ${dt.getFullYear()}`;
    };

    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {merged.length > 0 ? (
          <div className="space-y-5">
            {merged.map((exp) => (
              <div key={exp.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isMeteors ? "bg-white/10 text-white/50" : "bg-zinc-100 text-zinc-400"}`}>
                  {(exp.company || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold text-sm" style={{ color: textColor }}>{exp.title}</div>
                    <div className="text-[10px] flex-shrink-0" style={{ color: subTextColor }}>
                      {fmtExpDate(exp.startDate)}{exp.isCurrent ? " – Present" : exp.endDate ? ` – ${fmtExpDate(exp.endDate)}` : ""}
                    </div>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  {exp.description && (
                    <div className="text-xs mt-1.5 space-y-0.5" style={{ color: subTextColor }}>
                      {(exp.description as string).split("\n").filter(Boolean).map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: subTextColor }}>No experience entries yet. Add them in your Profile.</p>
        )}
      </div>
    );
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (section.type === "education") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const education = (profile?.education ?? []).filter((e) => !hiddenIds.includes(e.id));

    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isMeteors ? "bg-white/10 text-white/50" : "bg-zinc-100 text-zinc-400"}`}>
                  {edu.institution.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: textColor }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>{edu.institution}</div>
                  {edu.startDate && (
                    <div className="text-[10px] mt-0.5" style={{ color: subTextColor }}>
                      {new Date(edu.startDate).getFullYear()}{edu.isCurrent ? " – Present" : edu.endDate ? ` – ${new Date(edu.endDate).getFullYear()}` : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: subTextColor }}>No education entries yet. Add them in your Profile.</p>
        )}
      </div>
    );
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (section.type === "certifications") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const certs = (profile?.certifications ?? []).filter((c) => !hiddenIds.includes(c.id));
    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {certs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {certs.map((cert) => (
              <div key={cert.id} className={`p-4 border ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                <div className="font-semibold text-sm" style={{ color: textColor }}>{cert.name}</div>
                {cert.issuer && <div className="text-xs mt-0.5" style={{ color: accent }}>{cert.issuer}</div>}
                {cert.issueDate && (
                  <div className="text-[10px] mt-1" style={{ color: subTextColor }}>
                    Issued {new Date(cert.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
                    {cert.expiryDate ? ` · Expires ${new Date(cert.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}` : ""}
                  </div>
                )}
                {cert.credentialId && <div className="text-[10px] mt-0.5" style={{ color: subTextColor }}>ID: {cert.credentialId}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: subTextColor }}>No certifications yet. Add them in your Profile.</p>
        )}
      </div>
    );
  }

  // ── Extras ────────────────────────────────────────────────────────────────
  if (section.type === "extras") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const extras = (profile?.extras ?? []).filter((e) => !hiddenIds.includes(e.id));
    const byCategory = EXTRA_CATEGORIES.filter((cat) => extras.some((e) => e.category === cat));
    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {extras.length > 0 ? (
          <div className="space-y-6">
            {byCategory.map((cat) => (
              <div key={cat}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>{cat}</div>
                <div className="space-y-2">
                  {extras.filter((e) => e.category === cat).map((e) => (
                    <div key={e.id} className={`flex items-start justify-between gap-4 p-3 border ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                      <div>
                        <div className="font-medium text-sm" style={{ color: textColor }}>{e.title}</div>
                        {e.subtitle && <div className="text-xs mt-0.5" style={{ color: subTextColor }}>{e.subtitle}</div>}
                        {e.description && <div className="text-xs mt-1" style={{ color: subTextColor }}>{e.description}</div>}
                      </div>
                      {e.date && <div className="text-[10px] shrink-0" style={{ color: subTextColor }}>{new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {extras.filter((e) => !byCategory.includes(e.category)).map((e) => (
              <div key={e.id} className={`flex items-start justify-between gap-4 p-3 border ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                <div>
                  <div className="font-medium text-sm" style={{ color: textColor }}>{e.title}</div>
                  {e.subtitle && <div className="text-xs mt-0.5" style={{ color: subTextColor }}>{e.subtitle}</div>}
                </div>
                {e.date && <div className="text-[10px] shrink-0" style={{ color: subTextColor }}>{new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: subTextColor }}>No extras yet. Add awards, languages, publications, etc. in your Profile.</p>
        )}
      </div>
    );
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  if (section.type === "contact") {
    const enableForm = (section.content.enableForm as boolean) ?? true;
    const showEmail = (section.content.showEmail as boolean) ?? true;
    const showSocials = (section.content.showSocials as boolean) ?? true;

    return (
      <div className={`px-10 py-12 border-t ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        <div className="flex gap-10 flex-wrap">
          {enableForm && (
            <div className="flex-1 min-w-[200px] max-w-sm space-y-3">
              <input className={`w-full h-10 px-3 rounded-lg border text-sm bg-transparent ${borderColor}`} placeholder="Your name" style={{ color: textColor }} readOnly />
              <input className={`w-full h-10 px-3 rounded-lg border text-sm bg-transparent ${borderColor}`} placeholder="Email address" style={{ color: textColor }} readOnly />
              <textarea className={`w-full px-3 py-2 rounded-lg border text-sm resize-none bg-transparent ${borderColor}`} rows={3} placeholder="Message" style={{ color: textColor }} readOnly />
              <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: accent }}>Send message</button>
            </div>
          )}
          {(showEmail || showSocials) && (
            <div className="space-y-3 pt-1">
              {showEmail && (
                <div className="text-sm" style={{ color: subTextColor }}>
                  <span className="font-medium" style={{ color: textColor }}>Email </span>
                  {user.email ?? "your@email.com"}
                </div>
              )}
              {showSocials && (
                <div className="flex gap-3 flex-wrap">
                  {profile?.linkedinUrl && <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${borderColor}`} style={{ color: subTextColor }}>LinkedIn</div>}
                  {profile?.githubUrl && <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${borderColor}`} style={{ color: subTextColor }}>GitHub</div>}
                  {profile?.twitterUrl && <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${borderColor}`} style={{ color: subTextColor }}>Twitter / X</div>}
                  {(profile as any)?.instagramUrl && <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${borderColor}`} style={{ color: subTextColor }}>Instagram</div>}
                  {profile?.website && <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${borderColor}`} style={{ color: subTextColor }}>Website</div>}
                  {!profile?.linkedinUrl && !profile?.githubUrl && !profile?.twitterUrl && !(profile as any)?.instagramUrl && !profile?.website && (
                    <div className={`px-3 py-1.5 rounded-lg border text-xs ${borderColor}`} style={{ color: subTextColor }}>Add social links in Profile</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Social Links ──────────────────────────────────────────────────────────
  if (section.type === "social") {
    const layout = (section.content.layout as string) ?? "grid";
    const showLabels = (section.content.showLabels as boolean) ?? true;
    const links = [
      { label: "LinkedIn", url: profile?.linkedinUrl },
      { label: "GitHub", url: profile?.githubUrl },
      { label: "Twitter / X", url: profile?.twitterUrl },
      { label: "Instagram", url: (profile as any)?.instagramUrl },
      { label: "Website", url: profile?.website },
    ].filter((l) => l.url);

    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {links.length === 0 ? (
          <p className="text-sm" style={{ color: subTextColor }}>Add social links in Profile → Social tab to display them here.</p>
        ) : layout === "list" ? (
          <div className="space-y-2 max-w-xs">
            {links.map((l) => (
              <div key={l.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium ${borderColor}`} style={{ color: textColor }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                {l.label}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {links.map((l) => (
              <div key={l.label} className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border ${borderColor}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${accent}20` }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: accent }} />
                </div>
                {showLabels && <span className="text-[11px] font-medium" style={{ color: subTextColor }}>{l.label}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  if (section.type === "testimonials") {
    const items = (section.content.items as TestimonialItem[]) ?? [];
    return (
      <div className={`px-10 py-12 border-b ${borderColor}`}>
        <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{sectionTitle}</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className={`border p-4 space-y-3 ${borderColor}`} style={{ borderRadius: "var(--cr)" }}>
                <p className="text-sm italic leading-relaxed" style={{ color: subTextColor }}>&ldquo;{item.text || "..."}&rdquo;</p>
                <div>
                  <div className="text-xs font-semibold" style={{ color: textColor }}>{item.name || "Name"}</div>
                  <div className="text-[10px]" style={{ color: accent }}>{item.role || "Role, Company"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: subTextColor }}>Add testimonials using the left panel editor.</p>
        )}
      </div>
    );
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  return (
    <div className={`px-10 py-12 border-b ${borderColor}`}>
      <h2 className="text-xl font-bold tracking-tight mb-4" style={{ color: textColor }}>{sectionTitle}</h2>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-3 rounded-full ${isMeteors ? "bg-white/10" : "bg-zinc-100"}`} style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
