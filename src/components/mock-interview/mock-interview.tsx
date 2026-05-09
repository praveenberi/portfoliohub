"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  VideoCamera,
  ChatTeardropDots,
  CaretDown,
  ArrowSquareOut,
  Play,
  Stop,
  ArrowClockwise,
  DownloadSimple,
  Trash,
  CaretLeft,
  CaretRight,
  Sparkle,
  Lightbulb,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

// ─── Question bank ──────────────────────────────────────────────────────────
// Category → questions with optional sample-answer hints. Kept inline so
// there's no DB dependency; categories were chosen to roughly mirror the
// roles supported by Google Interview Warmup so the deep links feel natural.

type Question = { q: string; tip?: string };
type Category = {
  id: string;
  label: string;
  description: string;
  /** Slug used to deep-link into Google Interview Warmup when supported. */
  warmupSlug?: string;
  questions: Question[];
};

const CATEGORIES: Category[] = [
  {
    id: "general",
    label: "General / Behavioural",
    description: "Common questions every interviewer asks, regardless of role.",
    warmupSlug: "general",
    questions: [
      { q: "Tell me about yourself.", tip: "Open with a one-line headline (role + years), highlight 2–3 career milestones, end on why you're talking to *this* company today." },
      { q: "What are your greatest strengths?", tip: "Pick strengths the role actually needs. Pair each with a concrete proof point." },
      { q: "What's your biggest weakness?", tip: "Real weakness + the system you've built to manage it. Avoid clichés like 'perfectionist'." },
      { q: "Why do you want to work here?", tip: "Mention something specific you learned from their product, blog, or team — not generic praise." },
      { q: "Tell me about a time you had a conflict with a teammate.", tip: "Use STAR: Situation, Task, Action, Result. Focus on what *you* did to resolve it, not who was right." },
      { q: "Describe a time you failed and what you learned.", tip: "Pick something real with a measurable consequence. Show what you'd do differently now." },
      { q: "Where do you see yourself in 5 years?", tip: "Frame growth in terms of impact / scope / craft, not titles. Tie back to this role being a stepping stone." },
      { q: "Why are you leaving your current job?", tip: "Stay positive. Talk about what you're moving *toward*, not what you're escaping." },
      { q: "Tell me about a time you led a project.", tip: "Show how you defined success, kept the team aligned, and what you'd improve next time." },
      { q: "Do you have any questions for us?", tip: "Always say yes. Ask about team rituals, the success bar for this role at 6 months, or a recent decision they made." },
    ],
  },
  {
    id: "swe",
    label: "Software Engineering",
    description: "Technical and systems questions for engineering candidates.",
    questions: [
      { q: "Walk me through a recent technical project you're proud of.", tip: "State the problem, the constraints, your design decisions, and the outcome with metrics." },
      { q: "How do you approach debugging a production issue?", tip: "Reproduce → narrow the surface area → form a hypothesis → confirm with logs/metrics → fix → add a regression test." },
      { q: "Explain a system you designed end-to-end.", tip: "Cover data model, traffic shape, failure modes, and what you'd change at 10× scale." },
      { q: "How do you decide between building and buying?", tip: "Strategic vs. commodity, switching costs, total cost of ownership, in-house expertise." },
      { q: "Tell me about a code review that changed your mind.", tip: "Show humility and a concrete technical learning." },
      { q: "How do you balance shipping fast vs. shipping right?", tip: "Talk about reversible vs. irreversible decisions, blast radius, and feature flags." },
      { q: "Describe a time you had to mentor a junior engineer.", tip: "Specifics: what they were stuck on, how you adjusted your guidance, the outcome." },
      { q: "What's the worst bug you've ever shipped?", tip: "Own it. Talk about the postmortem and what you put in place to prevent recurrence." },
    ],
  },
  {
    id: "data",
    label: "Data Analytics",
    description: "Stats, SQL reasoning, and storytelling-with-data questions.",
    warmupSlug: "data-analytics",
    questions: [
      { q: "Walk me through how you'd analyse a sudden 15% drop in sign-ups.", tip: "Segment by channel/device/region first. Look for instrumentation issues before assuming a real drop." },
      { q: "Explain the difference between correlation and causation in plain English.", tip: "Use a concrete example. Mention confounders and the value of A/B tests for causal claims." },
      { q: "How do you decide between mean, median, and mode?", tip: "Skew, outliers, and what the audience actually needs to make a decision." },
      { q: "Describe a dashboard you built that drove a real decision.", tip: "Who was the audience, what metric did you elevate, what action did it trigger." },
      { q: "How do you communicate a confusing finding to non-technical stakeholders?", tip: "Lead with the so-what. Use one chart, plain language, and offer a recommended action." },
      { q: "When would you reach for SQL vs. Python for an analysis?", tip: "SQL for clean joins/aggregations on warehoused data; Python when you need iteration, ML, or messy data wrangling." },
    ],
  },
  {
    id: "product",
    label: "Product / Project Management",
    description: "Prioritisation, stakeholder, and delivery questions.",
    warmupSlug: "project-management",
    questions: [
      { q: "How do you prioritise competing requests from stakeholders?", tip: "Frame it as impact × confidence ÷ effort, but ground it in the team's strategic OKRs." },
      { q: "Tell me about a time you said no to an executive.", tip: "Show you respected the ask but pushed back with data and an alternative." },
      { q: "Walk me through how you'd launch a new feature end-to-end.", tip: "Cover discovery → spec → kickoff → milestones → rollout plan → success metric." },
      { q: "How do you measure success for a product you've shipped?", tip: "Tie metrics to the user problem, not vanity (DAU isn't always the answer)." },
      { q: "Describe a project that went off the rails. What did you do?", tip: "Show how you spotted the slip early, communicated transparently, and re-planned." },
      { q: "How do you handle a strong-willed engineer who disagrees with the spec?", tip: "Get curious first; often they've spotted a real issue. Then realign on the underlying user problem." },
    ],
  },
  {
    id: "ux",
    label: "UX / Design",
    description: "Process, critique, and impact questions for designers.",
    warmupSlug: "ux-design",
    questions: [
      { q: "Walk me through a design process from research to handoff.", tip: "Research → synthesis → ideation → prototyping → testing → handoff. Talk about a real project." },
      { q: "How do you handle critique that you disagree with?", tip: "Separate critique of the work from critique of the goal. Ask 'what would make this a yes for you?'" },
      { q: "Tell me about a design decision you regret.", tip: "Real example, what you'd test or change, what you learned about your process." },
      { q: "How do you measure the success of a design?", tip: "Mix of qualitative (interviews) and quantitative (task success rate, time on task, conversion)." },
      { q: "How do you advocate for accessibility on a fast-moving team?", tip: "Bake it into the definition of done; show ROI examples; partner with engineering on lint rules." },
    ],
  },
  {
    id: "support",
    label: "IT Support",
    description: "Troubleshooting, customer empathy, and process questions.",
    warmupSlug: "it-support",
    questions: [
      { q: "Walk me through how you'd handle a frustrated user with a non-reproducible bug.", tip: "Empathise first, then narrow the problem with focused questions and screen share." },
      { q: "How do you decide when to escalate vs. keep investigating?", tip: "Time-box, document what you've tried, and respect SLAs." },
      { q: "Describe your process for keeping documentation up to date.", tip: "Doc-as-you-go, ownership per article, quarterly audits." },
      { q: "Tell me about a tough ticket you resolved end-to-end.", tip: "Use STAR. Highlight the diagnostic steps, not just the fix." },
    ],
  },
  {
    id: "cyber",
    label: "Cybersecurity",
    description: "Defensive thinking, incident response, and risk-tradeoff questions.",
    warmupSlug: "cybersecurity",
    questions: [
      { q: "Walk me through how you'd triage a suspected phishing report from an employee.", tip: "Confirm the headers, check the URL/payload safely, search inbox for similar mail, advise the user, file an incident." },
      { q: "How do you balance security controls with developer velocity?", tip: "Lean on guardrails over gates: secure defaults, paved roads, and strong post-deploy detection." },
      { q: "What's your approach to threat-modelling a new feature?", tip: "STRIDE / data-flow diagram, identify trust boundaries, list mitigations and accepted risks." },
      { q: "Tell me about a time you discovered a real vulnerability.", tip: "Walk through how you found it, the blast radius assessment, and the disclosure process." },
    ],
  },
  {
    id: "sales",
    label: "Sales / GTM",
    description: "Discovery, objection-handling, and quota questions.",
    questions: [
      { q: "Walk me through your discovery process on a new opportunity.", tip: "MEDDIC or similar. Show how you qualify on metrics, economic buyer, decision criteria." },
      { q: "Tell me about your hardest objection and how you handled it.", tip: "Be specific about the objection, your response, and the outcome." },
      { q: "How do you build pipeline when inbound dries up?", tip: "Ranked outbound, referrals, partner channels, niche events." },
      { q: "What's a deal you lost? What would you do differently?", tip: "Show post-mortem rigor — process changes, not blame." },
    ],
  },
];

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const WARMUP_BASE = "https://grow.google/certificates/interview-warmup";

// ─── Component ──────────────────────────────────────────────────────────────

type Tab = "qa" | "video";

export function MockInterview() {
  const [tab, setTab] = useState<Tab>("qa");
  const [categoryId, setCategoryId] = useState<string>("general");
  const category = CATEGORY_BY_ID[categoryId];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Microphone size={22} weight="fill" className="text-accent-500" />
            Mock Interview
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Practise common questions for your role, then record video answers to hear yourself out loud.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
        {([
          { id: "qa", label: "Practice Q&A", icon: ChatTeardropDots },
          { id: "video", label: "Video Practice", icon: VideoCamera },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Icon size={16} weight={tab === id ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      {/* Category picker (shared between tabs) */}
      <CategoryPicker categoryId={categoryId} onChange={setCategoryId} />

      {/* Tab body */}
      {tab === "qa" && <QATab category={category} />}
      {tab === "video" && <VideoTab category={category} />}
    </div>
  );
}

// ─── Category picker ────────────────────────────────────────────────────────

function CategoryPicker({ categoryId, onChange }: { categoryId: string; onChange: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Choose a track</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CATEGORIES.map((c) => {
          const active = c.id === categoryId;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                active
                  ? "border-accent-500 bg-accent-50 shadow-[0_0_0_3px_rgba(34,197,94,0.18)]"
                  : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50"
              }`}
            >
              <div className={`text-sm font-semibold ${active ? "text-accent-700" : "text-zinc-950"}`}>
                {c.label}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{c.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Q&A tab ────────────────────────────────────────────────────────────────

function QATab({ category }: { category: Category }) {
  const warmupHref = category.warmupSlug ? `${WARMUP_BASE}/${category.warmupSlug}/` : `${WARMUP_BASE}/`;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Question list */}
      <div className="lg:col-span-2 space-y-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
          {category.questions.length} questions · {category.label}
        </div>
        {category.questions.map((qa, i) => (
          <QAItem key={i} index={i + 1} qa={qa} />
        ))}
      </div>

      {/* Side: Google Interview Warmup */}
      <div className="space-y-4">
        <div className="bg-zinc-950 text-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkle size={16} weight="fill" className="text-accent-400" />
            <span className="text-sm font-semibold">Google Interview Warmup</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed mb-4">
            Free AI-powered practice from Google. Speak your answer, get an instant transcript and insights on how
            often you used the interviewer's keywords, your most-used words, and pacing.
          </p>
          <a
            href={warmupHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            Open {category.label.split(" /")[0]} warmup
            <ArrowSquareOut size={12} weight="bold" />
          </a>
          {!category.warmupSlug && (
            <p className="text-[10px] text-white/50 mt-2">Opens the general entry point — pick your role inside.</p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-amber-600 mt-0.5 shrink-0" weight="fill" />
            <div>
              <div className="text-xs font-semibold text-amber-900">Pro tip</div>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-1">
                Read each question, plan a STAR answer in 30 s, then switch to <span className="font-semibold">Video Practice</span>{" "}
                and record it. Watching yourself back is the fastest way to spot filler words and pacing issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QAItem({ index, qa }: { index: number; qa: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold flex items-center justify-center mt-0.5">
          {index}
        </span>
        <span className="flex-1 text-sm font-medium text-zinc-950">{qa.q}</span>
        <CaretDown
          size={14}
          className={`text-zinc-400 mt-1.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && qa.tip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-[52px]">
              <div className="bg-zinc-50 border-l-2 border-accent-400 rounded-r-md px-3 py-2 text-[12px] text-zinc-600 leading-relaxed">
                <span className="font-semibold text-zinc-700">Hint:</span> {qa.tip}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Video tab ──────────────────────────────────────────────────────────────

function VideoTab({ category }: { category: Category }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingMime, setRecordingMime] = useState<string>("video/webm");

  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const question = category.questions[questionIndex] ?? category.questions[0];

  // Reset to first question when the category changes
  useEffect(() => {
    setQuestionIndex(0);
    discardRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  // Wire the live preview to the camera stream
  useEffect(() => {
    if (previewRef.current && stream) {
      previewRef.current.srcObject = stream;
    }
  }, [stream]);

  // Tear down the stream on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setPermissionError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      setStream(s);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      const msg =
        e.name === "NotAllowedError"
          ? "Camera/mic permission denied. Allow access in your browser settings and try again."
          : e.name === "NotFoundError"
          ? "No camera or microphone detected."
          : e.message ?? "Couldn't start the camera.";
      setPermissionError(msg);
    }
  }

  function stopCamera() {
    stopRecording();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function pickMimeType(): string {
    const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    for (const m of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
    }
    return "video/webm";
  }

  function startRecording() {
    if (!stream) return;
    discardRecording();
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordingUrl(url);
      setRecordingMime(mimeType);
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    recorder.start();
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function discardRecording() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setElapsed(0);
  }

  function downloadRecording() {
    if (!recordingUrl) return;
    const a = document.createElement("a");
    a.href = recordingUrl;
    const ext = recordingMime.includes("mp4") ? "mp4" : "webm";
    a.download = `mock-interview-${category.id}-q${questionIndex + 1}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Saved to your downloads");
  }

  function nextQuestion(delta: number) {
    const total = category.questions.length;
    setQuestionIndex((i) => (i + delta + total) % total);
    discardRecording();
  }

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Question prompt */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            <span>Question {questionIndex + 1} of {category.questions.length}</span>
            <span>{category.label}</span>
          </div>
          <p className="text-base font-semibold text-zinc-950 leading-snug">{question.q}</p>
          {question.tip && (
            <div className="mt-4 bg-zinc-50 border-l-2 border-accent-400 rounded-r-md px-3 py-2 text-[12px] text-zinc-600 leading-relaxed">
              <span className="font-semibold text-zinc-700">Hint:</span> {question.tip}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-4">
            <button
              onClick={() => nextQuestion(-1)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <CaretLeft size={12} /> Prev
            </button>
            <button
              onClick={() => nextQuestion(1)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Next <CaretRight size={12} weight="bold" />
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-amber-600 mt-0.5 shrink-0" weight="fill" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Recordings stay <span className="font-semibold">in your browser</span> — nothing uploads. Use the
              Save button to download a copy.
            </p>
          </div>
        </div>
      </div>

      {/* Camera + recording controls */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200">
          {recordingUrl ? (
            <video
              ref={playbackRef}
              src={recordingUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          ) : stream ? (
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
              <VideoCamera size={42} className="text-white/30 mb-3" />
              <div className="text-sm font-semibold text-white/90">Camera preview</div>
              <p className="text-xs text-white/50 mt-1 max-w-sm">
                {permissionError
                  ? permissionError
                  : "Click Start camera to begin. Your browser will ask for camera + microphone permission."}
              </p>
              <button
                onClick={startCamera}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-400 active:scale-[0.98] transition-all"
              >
                <VideoCamera size={14} weight="fill" /> Start camera
              </button>
            </div>
          )}

          {/* Recording badge */}
          {recording && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500 text-white text-[11px] font-semibold shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              REC {minutes}:{seconds}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-3 flex flex-wrap items-center gap-2">
          {!stream && !recordingUrl && (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent-500 text-white rounded-lg text-xs font-semibold hover:bg-accent-400 active:scale-[0.98] transition-all"
            >
              <VideoCamera size={13} weight="fill" /> Start camera
            </button>
          )}
          {stream && !recording && !recordingUrl && (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
            >
              <Play size={13} weight="fill" /> Record
            </button>
          )}
          {recording && (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <Stop size={13} weight="fill" /> Stop
            </button>
          )}
          {recordingUrl && (
            <>
              <button
                onClick={() => {
                  discardRecording();
                  if (!stream) startCamera();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
              >
                <ArrowClockwise size={13} weight="bold" /> Re-record
              </button>
              <button
                onClick={downloadRecording}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                <DownloadSimple size={13} weight="bold" /> Save
              </button>
              <button
                onClick={discardRecording}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-zinc-600 border border-zinc-200 rounded-lg text-xs font-medium hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] transition-all"
              >
                <Trash size={13} /> Discard
              </button>
            </>
          )}
          {stream && (
            <button
              onClick={stopCamera}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-white text-zinc-600 border border-zinc-200 rounded-lg text-xs font-medium hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] transition-all"
            >
              Turn off camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
