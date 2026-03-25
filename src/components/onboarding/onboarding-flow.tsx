"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Layout,
  Briefcase,
  User,
} from "@phosphor-icons/react";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
}

interface Props {
  templates: Template[];
  userName: string | null | undefined;
}

const STEPS = [
  { id: "welcome", title: "Welcome", icon: User },
  { id: "role", title: "Your Role", icon: Briefcase },
  { id: "template", title: "Choose Template", icon: Layout },
  { id: "profile", title: "Basic Info", icon: User },
];

const ROLE_OPTIONS = [
  { value: "DEVELOPER", label: "Software Developer", description: "Build web, mobile, or backend applications" },
  { value: "DESIGNER", label: "Designer", description: "UI/UX, graphic, or product design" },
  { value: "PHOTOGRAPHER", label: "Photographer", description: "Photography and visual arts" },
  { value: "MARKETING", label: "Marketing", description: "Growth, content, or performance marketing" },
  { value: "FOUNDER", label: "Founder / Entrepreneur", description: "Building startups and products" },
  { value: "OTHER", label: "Other", description: "Something else entirely" },
];

export function OnboardingFlow({ templates, userName }: Props) {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [profileData, setProfileData] = useState({ headline: "", location: "", openToWork: false });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const filteredTemplates =
    selectedRole && selectedRole !== "OTHER"
      ? templates.filter((t) => t.category === selectedRole || templates.filter((t2) => t2.category === selectedRole).length === 0 ? true : t.category === selectedRole)
      : templates;

  const visibleTemplates = filteredTemplates.length > 0 ? filteredTemplates : templates;

  async function finish() {
    setSaving(true);
    try {
      // Save basic profile info
      if (profileData.headline) {
        await axios.patch("/api/profile", {
          headline: profileData.headline,
          location: profileData.location,
          openToWork: profileData.openToWork,
        });
      }

      // Create portfolio with selected template
      if (selectedTemplate) {
        await axios.post("/api/portfolios", { templateId: selectedTemplate });
      }

      toast.success("Your portfolio is ready!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-white text-zinc-950"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {i < step ? <CheckCircle size={14} weight="fill" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-px transition-all ${i < step ? "bg-green-500" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1" fill="white" />
                  <rect x="10" y="2" width="6" height="6" rx="1" fill="white" fillOpacity="0.3" />
                  <rect x="2" y="10" width="6" height="6" rx="1" fill="white" fillOpacity="0.3" />
                  <rect x="10" y="10" width="6" height="6" rx="1" fill="#22c55e" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}
              </h1>
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
                Let&apos;s build your professional portfolio in a few quick steps.
              </p>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 text-sm font-semibold rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">
                What describes you best?
              </h2>
              <p className="text-zinc-400 text-center mb-8">We&apos;ll suggest templates based on your role.</p>

              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedRole === role.value
                        ? "border-green-500 bg-green-500/10 text-white"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-0.5">{role.label}</div>
                    <div className="text-xs text-zinc-500">{role.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-950 text-sm font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-40"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">
                Pick a template
              </h2>
              <p className="text-zinc-400 text-center mb-8">You can customize everything later.</p>

              <div className="grid md:grid-cols-2 gap-4 mb-8 max-h-80 overflow-y-auto pr-1">
                {visibleTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`text-left rounded-xl border overflow-hidden transition-all ${
                      selectedTemplate === template.id
                        ? "border-green-500 ring-1 ring-green-500"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="aspect-video bg-zinc-900 overflow-hidden">
                      {template.thumbnailUrl ? (
                        <Image
                          src={template.thumbnailUrl}
                          alt={template.name}
                          width={400}
                          height={250}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                          {template.name}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-white">{template.name}</div>
                        {selectedTemplate === template.id && (
                          <CheckCircle size={14} weight="fill" className="text-green-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTemplate}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-950 text-sm font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-40"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">
                Almost there
              </h2>
              <p className="text-zinc-400 text-center mb-8">A few details for your portfolio.</p>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Professional Headline</label>
                  <input
                    value={profileData.headline}
                    onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 transition-colors"
                    placeholder="Senior Full-Stack Engineer · Open to Remote"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Location (optional)</label>
                  <input
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-white focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 transition-colors"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    onClick={() => setProfileData({ ...profileData, openToWork: !profileData.openToWork })}
                    className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${profileData.openToWork ? "bg-green-500" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${profileData.openToWork ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                  <div>
                    <div className="text-sm font-medium text-white">Open to work</div>
                    <div className="text-xs text-zinc-500">Show recruiters you are available</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {saving ? "Setting up..." : "Launch Portfolio"}
                  {!saving && <ArrowRight size={14} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
