"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { parseArr, parseJson, parseProjectImages } from "@/lib/utils";
import {
  GithubLogo,
  LinkedinLogo,
  Globe,
  TwitterLogo,
  InstagramLogo,
  Envelope,
  MapPin,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import type { Portfolio, Template, User, Profile, Experience, Education, Project, Certification, Extra } from "@prisma/client";
import type { SectionConfig, PortfolioConfig, HeroContent } from "@/types";
import { GridBackground, DotBackground, AuroraBackground, Meteors } from "./animations";
import { ChatWidget } from "./chat-widget";

const FONT_MAP: Record<string, { family: string; url?: string }> = {
  geist: { family: "Inter, ui-sans-serif, system-ui, sans-serif" },
  satoshi: { family: "'DM Sans', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" },
  outfit: { family: "'Outfit', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" },
  "cabinet-grotesk": { family: "'Plus Jakarta Sans', ui-sans-serif, sans-serif", url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" },
};

type FullPortfolio = Portfolio & {
  template: Template | null;
  user: User & {
    profile: (Profile & {
      experiences: Experience[];
      education: Education[];
      projects: Project[];
      certifications: Certification[];
      extras: Extra[];
    }) | null;
  };
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownText({ text, textColor, mutedText, accent }: { text: string; textColor: string; mutedText: string; accent: string }) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flush = () => {
    if (!bullets.length) return;
    result.push(
      <ul key={key++} className="space-y-1.5 my-3 ml-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 leading-relaxed" style={{ color: mutedText }}>
            <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^## /.test(line)) {
      flush();
      result.push(
        <h3 key={key++} className="font-semibold text-xl mt-6 mb-2" style={{ color: textColor }}>
          {line.slice(3)}
        </h3>
      );
    } else if (/^[*\-] /.test(line)) {
      bullets.push(line.slice(2));
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      result.push(
        <p key={key++} className="leading-relaxed text-lg" style={{ color: mutedText }}>
          {line}
        </p>
      );
    }
  }
  flush();
  return <div className="space-y-1">{result}</div>;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <CaretLeft size={20} />
        </button>
      )}

      {/* Image */}
      <motion.img
        key={index}
        src={images[index]}
        alt={`Image ${index + 1}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <CaretRight size={20} />
        </button>
      )}
    </motion.div>
  );
}

// ─── Public Portfolio ─────────────────────────────────────────────────────────

export function PublicPortfolio({ portfolio }: { portfolio: FullPortfolio }) {
  const config = parseJson<PortfolioConfig>(portfolio.config as string, {} as PortfolioConfig);
  const sections = parseJson<SectionConfig[]>(portfolio.sections as string, []);
  const profile = portfolio.user.profile;
  const accent = config.primaryColor ?? "#22c55e";
  const bgStyle = config.backgroundStyle ?? "solid";
  const isMeteors = bgStyle === "meteors" || bgStyle === "image";
  const isImageBg = bgStyle === "image";
  const overlayOpacity = (config.backgroundImageOverlay ?? 40) / 100;
  const bgColor = isMeteors ? "#09090b" : (config.backgroundColor ?? "#ffffff");
  const textColor = isMeteors ? "#fafafa" : (config.textColor ?? "#09090b");
  const zoomMap = { sm: 0.875, md: 1, lg: 1.125, xl: 1.25 };
  const zoom = zoomMap[config.fontSize ?? "md"];
  const radiusMap = { sm: "4px", md: "16px", lg: "28px" };
  const cardRadius = radiusMap[config.borderRadius as keyof typeof radiusMap] ?? "16px";

  const sortedSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const hasAboutSection = sortedSections.some((s) => s.type === "about");
  const fontEntry = FONT_MAP[config.fontFamily ?? "geist"] ?? FONT_MAP.geist;

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = useCallback((images: string[], index: number) => setLightbox({ images, index }), []);

  return (
    <>
      {fontEntry.url && <style dangerouslySetInnerHTML={{ __html: `@import url("${fontEntry.url}");` }} />}
      <AnimatePresence>
        {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    <div
      className="min-h-[100dvh] font-sans antialiased relative"
      style={{ backgroundColor: bgColor, color: textColor, zoom, fontFamily: fontEntry.family, ["--cr" as string]: cardRadius } as React.CSSProperties}
    >
      {/* Background image */}
      {isImageBg && config.backgroundImageUrl && (
        <div className="fixed inset-0 z-0">
          <Image src={config.backgroundImageUrl} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        </div>
      )}
      {bgStyle === "grid" && <GridBackground color={accent} />}
      {bgStyle === "dots" && <DotBackground color={accent} />}
      {bgStyle === "aurora" && <AuroraBackground color={accent} />}
      {bgStyle === "meteors" && <Meteors color={accent} count={14} />}

      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 backdrop-blur-lg border-b"
        style={{
          backgroundColor: isMeteors ? "rgba(9,9,11,0.8)" : `${bgColor}cc`,
          borderColor: isMeteors ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
        <span className="font-semibold text-sm tracking-tight" style={{ color: textColor }}>
          {portfolio.user.name}
        </span>
        <div className="flex items-center gap-4">
          {sortedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.type}`}
              className="text-xs transition-colors hidden md:block"
              style={{ color: isMeteors ? "rgba(255,255,255,0.5)" : "rgb(113,113,122)" }}
            >
              {s.title}
            </a>
          ))}
          {profile?.linkedinUrl && (
            <Link href={profile.linkedinUrl} target="_blank" style={{ color: isMeteors ? "rgba(255,255,255,0.4)" : "rgb(161,161,170)" }}>
              <LinkedinLogo size={16} />
            </Link>
          )}
          {profile?.githubUrl && (
            <Link href={profile.githubUrl} target="_blank" style={{ color: isMeteors ? "rgba(255,255,255,0.4)" : "rgb(161,161,170)" }}>
              <GithubLogo size={16} />
            </Link>
          )}
        </div>
      </nav>

      <main className="pt-14 relative z-10">
        {sortedSections.map((section) => (
          <section key={section.id} id={section.type}>
            <SectionRenderer
              section={section}
              portfolio={portfolio}
              config={config}
              accent={accent}
              textColor={textColor}
              isMeteors={isMeteors}
              onImageClick={openLightbox}
              hasAboutSection={hasAboutSection}
            />
          </section>
        ))}
      </main>

      <footer
        className="border-t py-8 px-6 text-center relative z-10"
        style={{ borderColor: isMeteors ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
      >
        <p className="text-xs" style={{ color: isMeteors ? "rgba(255,255,255,0.3)" : "rgb(161,161,170)" }}>
          Built with{" "}
          <Link href="/" className="transition-colors hover:opacity-80" style={{ color: isMeteors ? "rgba(255,255,255,0.5)" : "rgb(113,113,122)" }}>
            myskillspage
          </Link>
        </p>
      </footer>

      {/* AI Chatbot — floats over the page */}
      <ChatWidget
        username={portfolio.user.username ?? ""}
        ownerName={portfolio.user.name ?? portfolio.user.username ?? "this person"}
        accentColor={accent}
      />
    </div>
    </>
  );
}

function HeroVideo({ src, className }: { src: string; className: string }) {
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

function SectionRenderer({
  section, portfolio, config, accent, textColor, isMeteors, onImageClick, hasAboutSection,
}: {
  section: SectionConfig;
  portfolio: FullPortfolio;
  config: PortfolioConfig;
  accent: string;
  textColor: string;
  isMeteors: boolean;
  onImageClick: (images: string[], index: number) => void;
  hasAboutSection: boolean;
}) {
  const profile = portfolio.user.profile;
  const user = portfolio.user;
  const border = isMeteors ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const mutedText = isMeteors ? "rgba(255,255,255,0.55)" : (config.secondaryTextColor ?? `${textColor}99`);
  const subtleText = isMeteors ? "rgba(255,255,255,0.35)" : `${textColor}66`;

  if (section.type === "hero") {
    const heroContent = section.content as HeroContent;
    const hasMedia = !!(heroContent.mediaUrl && heroContent.mediaType && heroContent.mediaType !== "none");
    const isBackground = (heroContent.mediaMode ?? "background") === "background";
    const isFeatured = heroContent.mediaMode === "featured";
    const overlayOpacity = (heroContent.overlayOpacity ?? 40) / 100;

    return (
      <div className="min-h-[100dvh] relative overflow-hidden flex items-center">
        {hasMedia && isBackground && (
          <div className="absolute inset-0 z-0">
            {heroContent.mediaType === "image" ? (
              <Image src={heroContent.mediaUrl!} alt="" fill className="object-cover" priority />
            ) : (
              <HeroVideo src={heroContent.mediaUrl!} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
          </div>
        )}

        {!hasMedia && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 70% 60% at 60% -10%, ${accent}18 0%, transparent 60%)` }}
          />
        )}

        {(() => {
          const showAvatarRight = !hasMedia && !!profile?.avatarUrl;
          const isTwoCols = (isFeatured && hasMedia) || showAvatarRight;
          return (
        <div className={`max-w-[1200px] mx-auto w-full px-6 md:px-20 py-20 relative z-10 ${isTwoCols ? "grid md:grid-cols-2 gap-16 items-center" : ""}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={isTwoCols ? "" : "max-w-2xl"}
          >

            {profile?.openToWork && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border mb-6"
                style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}0a` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                Open to work
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4"
              style={{ color: hasMedia && isBackground ? "#ffffff" : textColor }}>
              {user.name}
            </h1>

            {profile?.headline && (
              <p className="text-xl mb-6" style={{ color: hasMedia && isBackground ? "rgba(255,255,255,0.75)" : mutedText }}>
                {profile.headline}
              </p>
            )}

            {profile?.bio && !hasAboutSection && (
              <p className="text-base leading-relaxed max-w-[60ch] mb-8"
                style={{ color: hasMedia && isBackground ? "rgba(255,255,255,0.6)" : mutedText }}>
                {profile.bio}
              </p>
            )}

            {profile?.location && (
              <div className="flex items-center gap-1.5 text-sm mb-8" style={{ color: hasMedia && isBackground ? "rgba(255,255,255,0.5)" : subtleText }}>
                <MapPin size={14} /> {profile.location}
              </div>
            )}

            <div className="flex items-center gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl" style={{ background: accent }}>
                Get in touch
              </a>
              <a href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-colors"
                style={{
                  border: `1px solid ${hasMedia && isBackground ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.12)"}`,
                  color: hasMedia && isBackground ? "#ffffff" : textColor,
                }}>
                View work <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>

          {hasMedia && isFeatured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                {heroContent.mediaType === "image" ? (
                  <Image src={heroContent.mediaUrl!} alt={user.name ?? ""} fill className="object-cover" />
                ) : (
                  <HeroVideo src={heroContent.mediaUrl!} className="w-full h-full object-cover" />
                )}
              </div>
            </motion.div>
          )}

          {!hasMedia && profile?.avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <Image src={profile.avatarUrl} alt={user.name ?? ""} fill className="object-cover" />
              </div>
            </motion.div>
          )}
        </div>
          );
        })()}
      </div>
    );
  }

  if (section.type === "about") {
    const aboutBio = (section.content.bioOverride as string) || profile?.bio || "";
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>About</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className={profile?.avatarUrl ? "grid md:grid-cols-2 gap-16 items-center" : ""}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {aboutBio ? (
                <MarkdownText text={aboutBio} textColor={textColor} mutedText={mutedText} accent={accent} />
              ) : (
                <p className="leading-relaxed text-lg" style={{ color: mutedText }}>Add your bio in your profile settings.</p>
              )}
            </motion.div>
            {profile?.avatarUrl && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex justify-center">
                <Image src={profile.avatarUrl} alt={user.name ?? ""} width={400} height={514} className="rounded-2xl object-cover" style={{ aspectRatio: "400/514", width: 400, height: 514 }} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "skills") {
    const customSkills = (section.content.customSkills as string) ?? "";
    const displayStyle = (section.content.displayStyle as string) ?? "tags";
    const profileSkills = [...parseArr(profile?.skills), ...parseArr(profile?.technologies)];

    // Parse grouped format: ## Header\nskill1, skill2
    type SkillGroup = { label: string | null; skills: string[] };
    const groups: SkillGroup[] = (() => {
      if (!customSkills) return [{ label: null, skills: profileSkills }];
      if (/^## /m.test(customSkills)) {
        const result: SkillGroup[] = [];
        let label: string | null = null;
        let skills: string[] = [];
        for (const raw of customSkills.split("\n")) {
          const line = raw.trim();
          if (line.startsWith("## ")) {
            if (label !== null || skills.length) result.push({ label, skills });
            label = line.slice(3);
            skills = [];
          } else if (line) {
            skills.push(...line.split(",").map((s) => s.trim()).filter(Boolean));
          }
        }
        if (label !== null || skills.length) result.push({ label, skills });
        return result.filter((g) => g.skills.length > 0);
      }
      return [{ label: null, skills: customSkills.split(",").map((s) => s.trim()).filter(Boolean) }];
    })();

    if (groups.every((g) => g.skills.length === 0)) return null;

    const SkillTag = ({ skill, i }: { skill: string; i: number }) =>
      displayStyle === "list" ? (
        <motion.div key={skill} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ border: `1px solid ${border}`, color: textColor, backgroundColor: isMeteors ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)", borderRadius: "var(--cr)" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="text-sm font-medium">{skill}</span>
        </motion.div>
      ) : (
        <motion.div key={skill} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
          className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium"
          style={{ border: `1px solid ${border}`, color: mutedText, backgroundColor: isMeteors ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", borderRadius: "var(--cr)" }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="truncate">{skill}</span>
        </motion.div>
      );

    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Skills</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className="space-y-10">
            {groups.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <div className="text-sm font-semibold tracking-wide mb-4 pb-2 border-b"
                    style={{ color: accent, borderColor: `${accent}30` }}>
                    {group.label}
                  </div>
                )}
                {displayStyle === "list" ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {group.skills.map((skill, i) => <SkillTag key={skill} skill={skill} i={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {group.skills.map((skill, i) => <SkillTag key={skill} skill={skill} i={i} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "projects") {
    const allProjects = profile?.projects ?? [];
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const maxItems = (section.content.maxItems as number) ?? 20;
    const layout = (section.content.layout as string) ?? "grid";
    const showImages = (section.content.showImages as boolean) ?? false;
    const projects = allProjects.filter((p) => !hiddenIds.includes(p.id)).slice(0, maxItems);

    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Work</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>

          {layout === "list" ? (
            <div className="space-y-4">
              {projects.map((project, i) => {
                const imgs = parseProjectImages(project.imageUrl);
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="p-5 overflow-hidden" style={{ border: `1px solid ${border}`, borderRadius: "var(--cr)" }}>
                    {/* Always show images when they exist */}
                    {imgs.length > 0 && (
                      <div className={`mb-4 ${imgs.length > 9 ? "max-h-[480px] overflow-y-auto pr-1 scrollbar-thin" : ""}`}>
                        <div className={`grid gap-2 ${imgs.length === 1 ? "grid-cols-1" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {imgs.map((url, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={idx} src={url} alt={`${project.title} ${idx + 1}`} className="w-full aspect-video object-cover rounded-lg cursor-zoom-in" onClick={() => onImageClick(imgs, idx)} />
                          ))}
                        </div>
                        {imgs.length > 9 && (
                          <p className="text-center text-xs mt-2 opacity-50">Scroll to see all {imgs.length} photos</p>
                        )}
                      </div>
                    )}
                    {/* Placeholder only when showImages toggle is on and no images uploaded */}
                    {showImages && imgs.length === 0 && (
                      <div className="w-full aspect-video flex items-center justify-center text-xs font-medium mb-4 rounded-lg" style={{ backgroundColor: isMeteors ? "rgba(255,255,255,0.05)" : "#f4f4f5", color: subtleText }}>
                        {project.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold" style={{ color: textColor }}>{project.title}</h3>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {project.liveUrl && <Link href={project.liveUrl} target="_blank" className="text-xs font-medium flex items-center gap-1" style={{ color: mutedText }}><Globe size={12} /> Live</Link>}
                        {project.githubUrl && <Link href={project.githubUrl} target="_blank" className="text-xs font-medium flex items-center gap-1" style={{ color: mutedText }}><GithubLogo size={12} /> Code</Link>}
                      </div>
                    </div>
                    {project.description && (
                      <div className="text-sm mt-1">
                        <MarkdownText text={project.description} textColor={textColor} mutedText={mutedText} accent={accent} />
                      </div>
                    )}
                    {parseArr(project.technologies).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {parseArr(project.technologies).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${accent}12`, color: accent }}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={`grid gap-6 ${projects.length === 1 ? "grid-cols-1" : projects.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {projects.map((project, i) => {
                const imgs = parseProjectImages(project.imageUrl);
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="group overflow-hidden" style={{ border: `1px solid ${border}`, borderRadius: "var(--cr)" }}>
                    {/* Always show images when they exist */}
                    {imgs.length > 1 ? (
                      <div className={`p-1 ${imgs.length > 9 ? "max-h-52 overflow-y-auto scrollbar-thin" : ""}`} style={{ backgroundColor: isMeteors ? "rgba(255,255,255,0.03)" : "#f4f4f5" }}>
                        <div className="grid grid-cols-3 gap-1">
                          {imgs.map((url, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={idx} src={url} alt={`${project.title} ${idx + 1}`} className="w-full aspect-square object-cover rounded cursor-zoom-in" onClick={() => onImageClick(imgs, idx)} />
                          ))}
                        </div>
                        {imgs.length > 9 && (
                          <p className="text-center text-[10px] mt-1 opacity-40">Scroll · {imgs.length} photos</p>
                        )}
                      </div>
                    ) : imgs.length === 1 ? (
                      <div className="aspect-video overflow-hidden" style={{ backgroundColor: isMeteors ? "rgba(255,255,255,0.05)" : "#f4f4f5" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgs[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in" onClick={() => onImageClick(imgs, 0)} />
                      </div>
                    ) : showImages ? (
                      /* Placeholder only when showImages is on */
                      <div className="aspect-video flex items-center justify-center text-sm" style={{ backgroundColor: isMeteors ? "rgba(255,255,255,0.05)" : "#f4f4f5", color: subtleText }}>
                        {project.title}
                      </div>
                    ) : null}
                    <div className="p-6">
                      <h3 className="font-semibold mb-2" style={{ color: textColor }}>{project.title}</h3>
                      {project.description && (
                        <div className="text-sm mb-4">
                          <MarkdownText text={project.description} textColor={textColor} mutedText={mutedText} accent={accent} />
                        </div>
                      )}
                      {parseArr(project.technologies).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {parseArr(project.technologies).map((tech) => (
                            <span key={tech} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${accent}12`, color: accent }}>{tech}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        {project.liveUrl && <Link href={project.liveUrl} target="_blank" className="text-xs font-medium flex items-center gap-1" style={{ color: mutedText }}><Globe size={12} /> Live demo</Link>}
                        {project.githubUrl && <Link href={project.githubUrl} target="_blank" className="text-xs font-medium flex items-center gap-1" style={{ color: mutedText }}><GithubLogo size={12} /> Source</Link>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (section.type === "experience") {
    const hiddenIds = (section.content.hiddenIds as string[]) ?? [];
    const maxItems = (section.content.maxItems as number) ?? 5;
    const layout = (section.content.layout as string) ?? "grid";
    const experiences = (profile?.experiences ?? [])
      .filter((e) => !hiddenIds.includes(e.id))
      .slice(0, maxItems);
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Career</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className={layout === "list" ? "space-y-4" : "grid md:grid-cols-2 gap-6"}>
            {experiences.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5" style={{ border: `1px solid ${border}`, borderRadius: "var(--cr)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}12` }}>
                  <Briefcase size={18} style={{ color: accent }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: textColor }}>{exp.title}</div>
                      <div className="text-sm" style={{ color: mutedText }}>{exp.company}{exp.location && ` · ${exp.location}`}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: subtleText }}>
                      {new Date(exp.startDate).getFullYear()} — {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="mt-2 text-sm">
                      <MarkdownText text={exp.description} textColor={textColor} mutedText={mutedText} accent={accent} />
                    </div>
                  )}
                  {parseArr(exp.skills).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {parseArr(exp.skills).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${accent}12`, color: accent }}>{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "education") {
    const education = profile?.education ?? [];
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Education</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className="space-y-6">
            {education.map((edu, i) => (
              <motion.div key={edu.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-6 pb-6 border-b last:border-0" style={{ borderColor: border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}12` }}>
                  <GraduationCap size={18} style={{ color: accent }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: textColor }}>{edu.institution}</div>
                      <div className="text-sm" style={{ color: mutedText }}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: subtleText }}>
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                    </div>
                  </div>
                  {edu.gpa && <p className="mt-1 text-sm" style={{ color: mutedText }}>GPA: {edu.gpa}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "certifications") {
    const certs = profile?.certifications ?? [];
    if (certs.length === 0) return null;
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Certifications</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {certs.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5" style={{ border: `1px solid ${border}`, borderRadius: "var(--cr)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}12` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: textColor }}>{cert.name}</div>
                  <div className="text-sm mt-0.5" style={{ color: mutedText }}>{cert.issuer}</div>
                  {(cert.issueDate || cert.expiryDate) && (
                    <div className="text-xs mt-1" style={{ color: subtleText }}>
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : ""}
                      {cert.expiryDate ? ` — ${new Date(cert.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}` : ""}
                    </div>
                  )}
                  {cert.credentialUrl && (
                    <Link href={cert.credentialUrl} target="_blank" className="text-xs font-medium mt-2 inline-flex items-center gap-1" style={{ color: accent }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      View credential
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "extras") {
    const extras = profile?.extras ?? [];
    if (extras.length === 0) return null;
    const categories = Array.from(new Set(extras.map((e) => e.category)));
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>{category}</div>
                <div className="space-y-3">
                  {extras.filter((e) => e.category === category).map((extra, i) => (
                    <motion.div key={extra.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="flex items-start justify-between gap-6 py-3 border-b last:border-0" style={{ borderColor: border }}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm" style={{ color: textColor }}>
                          {extra.url ? (
                            <Link href={extra.url} target="_blank" className="hover:underline underline-offset-2">{extra.title}</Link>
                          ) : extra.title}
                        </div>
                        {extra.subtitle && <div className="text-sm mt-0.5" style={{ color: mutedText }}>{extra.subtitle}</div>}
                        {extra.description && <div className="text-sm mt-1 leading-relaxed" style={{ color: subtleText }}>{extra.description}</div>}
                      </div>
                      {extra.date && (
                        <div className="text-xs flex-shrink-0 mt-0.5" style={{ color: subtleText }}>
                          {new Date(extra.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "testimonials") {
    const items = (section.content.items as Array<{ id: string; name: string; role: string; text: string }>) ?? [];
    if (items.length === 0) return null;
    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Testimonials</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 space-y-4" style={{ border: `1px solid ${border}`, borderRadius: "var(--cr)" }}>
                <p className="text-sm leading-relaxed italic" style={{ color: mutedText }}>&ldquo;{item.text}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold" style={{ color: textColor }}>{item.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>{item.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === "social") {
    const layout = (section.content.layout as string) ?? "grid";
    const showLabels = (section.content.showLabels as boolean) ?? true;

    const links: { label: string; url: string; icon: React.ReactNode }[] = [
      profile?.linkedinUrl && { label: "LinkedIn", url: profile.linkedinUrl, icon: <LinkedinLogo size={22} weight="fill" /> },
      profile?.githubUrl && { label: "GitHub", url: profile.githubUrl, icon: <GithubLogo size={22} weight="fill" /> },
      profile?.twitterUrl && { label: "Twitter / X", url: profile.twitterUrl, icon: <TwitterLogo size={22} weight="fill" /> },
      (profile as any)?.instagramUrl && { label: "Instagram", url: (profile as any).instagramUrl, icon: <InstagramLogo size={22} weight="fill" /> },
      profile?.website && { label: "Website", url: profile.website, icon: <Globe size={22} weight="fill" /> },
    ].filter(Boolean) as { label: string; url: string; icon: React.ReactNode }[];

    if (links.length === 0) return null;

    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Connect</div>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: textColor }}>{section.title}</h2>
          {layout === "list" ? (
            <div className="space-y-3 max-w-sm">
              {links.map((l, i) => (
                <motion.a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all hover:scale-[1.02]"
                  style={{ borderColor: border, color: textColor, backgroundColor: isMeteors ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.01)" }}>
                  <span style={{ color: accent }}>{l.icon}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                  <ArrowUpRight size={14} className="ml-auto" style={{ color: mutedText }} />
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {links.map((l, i) => (
                <motion.a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border transition-all hover:scale-105"
                  style={{ borderColor: border, backgroundColor: isMeteors ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}>
                  <span style={{ color: accent }}>{l.icon}</span>
                  {showLabels && <span className="text-xs font-medium" style={{ color: mutedText }}>{l.label}</span>}
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (section.type === "contact") {
    const enableForm = (section.content.enableForm as boolean) ?? true;
    const showEmail = (section.content.showEmail as boolean) ?? true;
    const showSocials = (section.content.showSocials as boolean) ?? true;

    return (
      <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: accent }}>Contact</div>
            <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: textColor }}>{section.title}</h2>
            <p className="leading-relaxed mb-8" style={{ color: mutedText }}>Interested in working together? I&apos;d love to hear from you.</p>
            {(showEmail || showSocials) && (
              <div className="space-y-3">
                {showSocials && profile?.linkedinUrl && <Link href={profile.linkedinUrl} target="_blank" className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><LinkedinLogo size={18} /> LinkedIn</Link>}
                {showSocials && profile?.githubUrl && <Link href={profile.githubUrl} target="_blank" className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><GithubLogo size={18} /> GitHub</Link>}
                {showSocials && profile?.twitterUrl && <Link href={profile.twitterUrl} target="_blank" className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><TwitterLogo size={18} /> Twitter / X</Link>}
                {showSocials && (profile as any)?.instagramUrl && <Link href={(profile as any).instagramUrl} target="_blank" className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><InstagramLogo size={18} /> Instagram</Link>}
                {showSocials && profile?.website && <Link href={profile.website} target="_blank" className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><Globe size={18} /> Website</Link>}
                {showEmail && user.email && <Link href={`mailto:${user.email}`} className="flex items-center gap-3 text-sm" style={{ color: mutedText }}><Envelope size={18} /> {user.email}</Link>}
              </div>
            )}
          </div>
          {enableForm && (
            <div>
              <ContactForm
                username={portfolio.user.username ?? ""}
                accent={accent}
                border={border}
                textColor={textColor}
                mutedText={mutedText}
                isMeteors={isMeteors}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 md:px-20 border-t" style={{ borderColor: border }}>
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-6" style={{ color: textColor }}>{section.title}</h2>
      </div>
    </div>
  );
}

// ── Contact form (interactive) ─────────────────────────────────────────────────

function ContactForm({
  username,
  accent,
  border,
  textColor,
  mutedText,
  isMeteors,
}: {
  username: string;
  accent: string;
  border: string;
  textColor: string;
  mutedText: string;
  isMeteors: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, username }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle = {
    border: `1px solid ${border}`,
    backgroundColor: isMeteors ? "rgba(255,255,255,0.05)" : "transparent",
    color: textColor,
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${accent}20` }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: textColor }}>Message sent!</p>
        <p className="text-xs" style={{ color: mutedText }}>I&apos;ll get back to you as soon as possible.</p>
        <button onClick={() => setStatus("idle")} className="text-xs mt-2 underline underline-offset-4" style={{ color: mutedText }}>Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: mutedText }}>Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none"
          style={inputStyle}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: mutedText }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none"
          style={inputStyle}
          placeholder="you@email.com"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: mutedText }}>Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none"
          style={inputStyle}
          placeholder="What's on your mind?"
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-red-500">Failed to send. Please try again or email directly.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ background: accent }}
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
