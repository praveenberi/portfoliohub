"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  VideoCamera,
  ChatTeardropDots,
  Sparkle,
  Play,
  Stop,
  ArrowClockwise,
  Trash,
  CaretRight,
  CaretLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  Robot,
  SpeakerHigh,
  PaperPlaneRight,
  Pencil,
  X,
  Wrench,
} from "@phosphor-icons/react";
import axios from "axios";
import toast from "react-hot-toast";
import { parseArr } from "@/lib/utils";

// Aria the virtual interviewer. Loads /public/aria-interviewer.jpg first, with
// a Pollinations fallback so the avatar still renders if the file is missing.
const INTERVIEWER_PORTRAIT_URL = "/aria-interviewer.jpg";
const INTERVIEWER_PORTRAIT_FALLBACK = (() => {
  const prompt = "young professional woman interviewer in her early twenties, fresh youthful face, bright friendly smile, sleek silky long dark hair, modern slim-fit navy blazer over white shirt, simple delicate jewellery, clean bright modern office with soft natural daylight, minimal background, photorealistic dslr headshot, sharp focus on face, looking directly at camera, magazine quality portrait";
  const params = new URLSearchParams({ width: "768", height: "1024", seed: "30621", nologo: "true", enhance: "true" });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
})();

const TOPIC_SUGGESTIONS: { label: string; topic: string }[] = [
  { label: "React", topic: "React (hooks, performance, state management)" },
  { label: "Node.js", topic: "Node.js backend (Express, async patterns, performance)" },
  { label: "TypeScript", topic: "TypeScript (generics, narrowing, utility types)" },
  { label: "AWS", topic: "AWS cloud architecture (EC2, S3, Lambda, IAM, networking)" },
  { label: "SQL", topic: "SQL (joins, indexing, query optimisation)" },
  { label: "Python", topic: "Python (data structures, async, idiomatic patterns)" },
  { label: "System Design", topic: "System design fundamentals (scalability, caching, sharding, consistency)" },
  { label: "Data Analytics", topic: "Data analytics (statistics, A/B tests, causal inference)" },
  { label: "Machine Learning", topic: "Machine learning fundamentals (overfitting, regularisation, evaluation)" },
  { label: "Cybersecurity", topic: "Cybersecurity (OWASP, threat modelling, incident response)" },
  { label: "DevOps", topic: "DevOps (CI/CD, observability, IaC)" },
  { label: "Behavioural", topic: "Behavioural interview questions using STAR framework" },
  { label: "Leadership", topic: "Engineering leadership (mentoring, cross-team, delivery)" },
  { label: "Product", topic: "Product management (prioritisation, metrics, discovery)" },
];

type Tab = "qa" | "video" | "mine";
type LaunchTarget = Exclude<Tab, "mine">;

export function MockInterview({ isAdmin = false }: { isAdmin?: boolean }) {
  const [tab, setTab] = useState<Tab>("qa");
  const [presetTopic, setPresetTopic] = useState<string | null>(null);

  function launchWithTopic(target: LaunchTarget, topic: string) {
    setPresetTopic(topic);
    setTab(target);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Microphone size={22} weight="fill" className="text-accent-500" />
            Mock Interview
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Practise on AI-generated questions tailored to your topic, then face an AI interviewer on video.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
        {([
          { id: "qa", label: "AI Quiz", icon: ChatTeardropDots },
          { id: "video", label: "Video Interview", icon: VideoCamera },
          { id: "mine", label: "My Skills", icon: Wrench },
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

      {tab === "qa" && <AIQuizPanel initialTopic={presetTopic} />}
      {tab === "video" && <VideoInterviewPanel isAdmin={isAdmin} initialTopic={presetTopic} />}
      {tab === "mine" && <MySkillsPanel onLaunch={launchWithTopic} />}
    </div>
  );
}

// ─── Topic + difficulty form ────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

function TopicForm({
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  count,
  setCount,
  countLabel,
  showCount = true,
  onSubmit,
  submitting,
  submitLabel,
  intro,
}: {
  topic: string;
  setTopic: (v: string) => void;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
  count: number;
  setCount: (v: number) => void;
  countLabel: string;
  showCount?: boolean;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  intro?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
      {intro}

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Topic / technology</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. React performance, Kubernetes, behavioural leadership questions…"
          className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
        />
        <div className="flex flex-wrap gap-1 pt-1">
          {TOPIC_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setTopic(s.topic)}
              className="px-2 py-0.5 text-[11px] font-medium rounded-md border border-zinc-200 text-zinc-600 hover:border-accent-400 hover:text-accent-700 hover:bg-accent-50 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid ${showCount ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Difficulty</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2 text-[11px] font-medium rounded-lg border capitalize transition-all ${
                  difficulty === d
                    ? "border-accent-500 bg-accent-50 text-accent-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {showCount && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{countLabel}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 5, 10, 15].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`py-2 text-[11px] font-medium rounded-lg border transition-all ${
                    count === n
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || topic.trim().length < 2}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkle size={14} weight="fill" /> {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}

// ─── AI Quiz panel ──────────────────────────────────────────────────────────

type QuizQuestion = {
  q: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
};
type Quiz = {
  topic: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
};

function AIQuizPanel({ initialTopic }: { initialTopic?: string | null }) {
  const [topic, setTopic] = useState(initialTopic?.trim() || "React (hooks, performance, state management)");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    setGenerating(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const { data } = await axios.post("/api/ai/interview-quiz", { topic, difficulty, count });
      setQuiz(data?.data ?? null);
      if (!data?.data?.questions?.length) toast.error("AI returned no questions — try again");
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to generate quiz";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }

  function reset() {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
  }

  if (!quiz) {
    return (
      <TopicForm
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        count={count}
        setCount={setCount}
        countLabel="Number of questions"
        onSubmit={generate}
        submitting={generating}
        submitLabel="Generate quiz"
        intro={
          <div className="flex items-start gap-2">
            <Sparkle size={16} weight="fill" className="text-accent-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600 leading-relaxed">
              Pick a technology or topic, choose a difficulty, and AI will draft a multiple-choice quiz. Answer all
              questions, then submit to see your score and explanations.
            </p>
          </div>
        }
      />
    );
  }

  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const correctCount = submitted ? quiz.questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const allAnswered = answered === total;

  return (
    <div className="space-y-4">
      {/* Header strip */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{difficulty} · {total} questions</div>
          <div className="text-sm font-semibold text-zinc-950 mt-0.5 line-clamp-1">{quiz.topic}</div>
        </div>
        <div className="flex items-center gap-2">
          {submitted && (
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              correctCount / total >= 0.7 ? "bg-accent-50 text-accent-700"
              : correctCount / total >= 0.4 ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
            }`}>
              {correctCount} / {total}
            </div>
          )}
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            New quiz
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {quiz.questions.map((q, i) => (
          <QuizCard
            key={i}
            index={i + 1}
            question={q}
            selected={answers[i]}
            submitted={submitted}
            onSelect={(opt) => setAnswers((a) => ({ ...a, [i]: opt }))}
          />
        ))}
      </div>

      {/* Submit / overall feedback */}
      {!submitted ? (
        <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-zinc-200 p-4 sticky bottom-4 shadow-md">
          <div className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">{answered}</span> of {total} answered
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-400 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <CheckCircle size={14} weight="fill" /> Submit answers
          </button>
        </div>
      ) : (
        <div className="bg-zinc-950 text-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkle size={16} weight="fill" className="text-accent-400" />
            <span className="text-sm font-semibold">AI feedback</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            You scored <span className="font-bold text-accent-300">{correctCount} of {total}</span>{" "}
            ({Math.round((correctCount / total) * 100)}%). Read the explanations on each question — they call out the
            common pitfalls. Click <span className="font-semibold">New quiz</span> to drill the same topic again or
            switch to a different one.
          </p>
        </div>
      )}
    </div>
  );
}

function QuizCard({
  index,
  question,
  selected,
  submitted,
  onSelect,
}: {
  index: number;
  question: QuizQuestion;
  selected?: string;
  submitted: boolean;
  onSelect: (opt: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold flex items-center justify-center mt-0.5">
          {index}
        </span>
        <span className="flex-1 text-sm font-semibold text-zinc-950 leading-snug">{question.q}</span>
      </div>

      <div className="mt-3 ml-9 space-y-1.5">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = submitted && opt.id === question.correct;
          const isWrong = submitted && isSelected && opt.id !== question.correct;
          const tone = submitted
            ? isCorrect
              ? "border-accent-500 bg-accent-50 text-accent-900"
              : isWrong
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-zinc-200 text-zinc-600"
            : isSelected
            ? "border-accent-500 bg-accent-50 text-accent-900"
            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50";
          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg border text-xs transition-all disabled:cursor-default ${tone}`}
            >
              <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                isCorrect ? "border-accent-500 bg-accent-500 text-white"
                : isWrong ? "border-red-400 bg-red-400 text-white"
                : isSelected ? "border-accent-500 bg-accent-500 text-white"
                : "border-zinc-300"
              }`}>
                {isCorrect ? <CheckCircle size={10} weight="fill" /> : isWrong ? <XCircle size={10} weight="fill" /> : opt.id.toUpperCase()}
              </span>
              <span className="flex-1 leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-3 ml-9 flex items-start gap-2 bg-zinc-50 border-l-2 border-accent-400 rounded-r-md px-3 py-2 text-[12px] text-zinc-700 leading-relaxed">
          <Lightbulb size={12} weight="fill" className="text-accent-500 mt-0.5 shrink-0" />
          <span><span className="font-semibold">Explanation:</span> {question.explanation}</span>
        </div>
      )}
    </div>
  );
}

// ─── Video Interview panel (virtual interviewer) ────────────────────────────

type Evaluation = {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
};

type InterviewTurn = {
  id: string;
  question: string;
  /** ms offset from interview start when the question was first shown. */
  askedAt: number;
  answer?: string;
  evaluation?: Evaluation;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; isFinal?: boolean }>> & { length: number } }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};

function VideoInterviewPanel({ isAdmin = false, initialTopic }: { isAdmin?: boolean; initialTopic?: string | null }) {
  const [topic, setTopic] = useState(initialTopic?.trim() || "Behavioural interview questions using STAR framework");
  const [portraitVersion, setPortraitVersion] = useState<number>(0); // cache-buster for the local photo
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const portraitSrc = `${INTERVIEWER_PORTRAIT_URL}${portraitVersion ? `?v=${portraitVersion}` : ""}`;
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewStart, setInterviewStart] = useState<number | null>(null);

  // Camera / recording
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingMime, setRecordingMime] = useState("video/webm");

  // Transcription / evaluation
  const [transcript, setTranscript] = useState("");
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [speakingQuestion, setSpeakingQuestion] = useState(false);

  const previewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const currentTurn = turns[questionIndex];
  const currentQuestion = currentTurn?.question ?? "";
  const hasInterview = turns.length > 0;
  const totalQuestions = turns.length;

  // Bind preview to stream
  useEffect(() => {
    if (previewRef.current && stream) previewRef.current.srcObject = stream;
  }, [stream]);

  // Cleanup
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateInterview() {
    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/interview-quiz", { topic, difficulty, count });
      const qs: string[] = (data?.data?.questions ?? [])
        .map((q: QuizQuestion) => q.q)
        .filter(Boolean);
      if (qs.length === 0) {
        toast.error("AI returned no questions — try a different topic");
        return;
      }
      const start = Date.now();
      setInterviewStart(start);
      const newTurns: InterviewTurn[] = qs.map((q, i) => ({
        id: `turn-${start}-${i}`,
        question: q,
        askedAt: i === 0 ? 0 : -1, // -1 = not yet shown
      }));
      setTurns(newTurns);
      setQuestionIndex(0);
      resetForNewQuestion();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to start interview";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }

  function endInterview() {
    stopRecording();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setTurns([]);
    setQuestionIndex(0);
    setInterviewStart(null);
    resetForNewQuestion();
    try { window.speechSynthesis?.cancel(); } catch {}
  }

  function resetForNewQuestion() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setTranscript("");
    setEvaluation(null);
    setEditingTranscript(false);
    setElapsed(0);
  }

  function nextQuestion(delta: number) {
    const total = turns.length;
    if (total === 0) return;
    const newIndex = (questionIndex + delta + total) % total;
    setQuestionIndex(newIndex);
    // Stamp askedAt the first time the user actually views a question
    if (interviewStart && turns[newIndex]?.askedAt < 0) {
      setTurns((t) => {
        const next = [...t];
        next[newIndex] = { ...next[newIndex], askedAt: Date.now() - interviewStart };
        return next;
      });
    }
    // Restore any saved answer / evaluation for this turn
    const t = turns[newIndex];
    setTranscript(t?.answer ?? "");
    setEvaluation(t?.evaluation ?? null);
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setEditingTranscript(false);
    setElapsed(0);
  }

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
      setPermissionError(
        e.name === "NotAllowedError"
          ? "Camera/mic permission denied. Allow access in your browser settings and try again."
          : e.name === "NotFoundError"
          ? "No camera or microphone detected."
          : e.message ?? "Couldn't start the camera."
      );
    }
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
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
      setRecordingUrl(null);
    }
    setEvaluation(null);
    setTranscript("");
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
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

    // Live transcription via Web Speech API (best-effort, browser-dependent)
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (Ctor) {
      try {
        const rec = new Ctor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = navigator.language || "en-US";
        let liveText = "";
        rec.onresult = (event) => {
          let interim = "";
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const alt = result[0];
            if (result[0] && (result[0] as { isFinal?: boolean }).isFinal) {
              liveText += (alt?.transcript ?? "") + " ";
            } else {
              interim += alt?.transcript ?? "";
            }
          }
          setTranscript((liveText + interim).trim());
        };
        rec.onerror = () => {};
        rec.onend = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch {
        recognitionRef.current = null;
      }
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    } catch {}
  }

  function discardRecording() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setEvaluation(null);
    setElapsed(0);
  }

  // Pick a clearly female English voice from the browser's installed set.
  // Voice availability varies by OS/browser, so we walk a ranked list of
  // names and fall back through known female voices before settling for the
  // first English voice (or any voice as a last resort).
  function pickFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    const en = voices.filter((v) => /en[-_]/i.test(v.lang));
    const pool = en.length > 0 ? en : voices;
    // Voices known to be female across major platforms
    const ranked = [
      "samantha", "victoria", "karen", "tessa", "fiona", "moira", "kate", "serena",
      "google uk english female", "google us english", "microsoft zira", "microsoft aria",
      "microsoft jenny", "microsoft michelle", "microsoft sonia", "microsoft heera",
      "microsoft hazel", "microsoft eva", "ava", "allison", "susan", "linda",
    ];
    for (const name of ranked) {
      const v = pool.find((v) => v.name.toLowerCase().includes(name));
      if (v) return v;
    }
    // Some platforms expose `gender` (non-standard). Try that next.
    const explicit = pool.find((v) => (v as unknown as { gender?: string }).gender === "female");
    if (explicit) return explicit;
    // Fall back to any English voice, then any voice
    return pool[0] ?? voices[0] ?? null;
  }

  function speakQuestion() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentQuestion);
    utter.rate = 0.95;
    utter.pitch = 1.05; // slightly higher than default reads more clearly female
    const voice = pickFemaleVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    utter.onstart = () => setSpeakingQuestion(true);
    utter.onend = () => setSpeakingQuestion(false);
    utter.onerror = () => setSpeakingQuestion(false);
    window.speechSynthesis.speak(utter);
  }

  // Voice list often loads asynchronously — make sure it's primed so the very
  // first speakQuestion call already has a female voice to pick from.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices(); // triggers async load on some browsers
    const handler = () => { /* no-op — getVoices() will return the populated list next call */ };
    window.speechSynthesis.addEventListener?.("voiceschanged", handler);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
  }, []);

  async function handlePortraitFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10 MB)");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use JPG, PNG, or WebP");
      return;
    }
    setUploadingPhoto(true);
    const id = toast.loading("Uploading Aria's photo…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post("/api/admin/interviewer-photo", fd);
      const v = (res.data?.v as number) ?? Date.now();
      setPortraitVersion(v);
      toast.success("Aria's photo updated", { id });
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Upload failed";
      toast.error(msg, { id });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  // Auto-speak the question when it changes (after a small delay so voices load)
  useEffect(() => {
    if (!hasInterview) return;
    const t = setTimeout(() => speakQuestion(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, hasInterview]);

  async function evaluateAnswer() {
    if (!transcript.trim()) {
      toast.error("No answer detected. Type your answer below or re-record.");
      return;
    }
    setEvaluating(true);
    try {
      const { data } = await axios.post("/api/ai/interview-evaluate", {
        question: currentQuestion,
        answer: transcript.trim(),
        topic,
      });
      const evalData: Evaluation | null = data?.data ?? null;
      setEvaluation(evalData);
      if (evalData) {
        // Persist answer + evaluation into the turn so the Copilot Answers feed
        // can render them and we can navigate back without losing state.
        const finalAnswer = transcript.trim();
        setTurns((prev) => {
          const next = [...prev];
          if (next[questionIndex]) {
            next[questionIndex] = {
              ...next[questionIndex],
              answer: finalAnswer,
              evaluation: evalData,
            };
          }
          return next;
        });
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to evaluate";
      toast.error(msg);
    } finally {
      setEvaluating(false);
    }
  }

  // Format ms offset as mm:ss
  function fmtOffset(ms: number) {
    if (ms < 0) ms = 0;
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (!hasInterview) {
    return (
      <TopicForm
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        count={count}
        setCount={setCount}
        countLabel="Number of rounds"
        onSubmit={generateInterview}
        submitting={generating}
        submitLabel="Start AI interview"
        intro={
          <div className="flex items-start gap-2">
            <Robot size={16} weight="fill" className="text-accent-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600 leading-relaxed">
              An AI interviewer will ask you questions out loud, one at a time. Record your spoken answer — your
              browser will transcribe it — then submit for AI feedback. Recordings stay in your browser.
            </p>
          </div>
        }
      />
    );
  }

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  const hasAnyAnswered = turns.some((t) => !!t.evaluation);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
      {/* ── Left: Interview Room ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
            <VideoCamera size={15} weight="fill" className="text-accent-500" />
            Interview Room
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={speakQuestion}
              title="Replay the question"
              className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-accent-700 transition-colors"
            >
              <SpeakerHigh size={14} weight={speakingQuestion ? "fill" : "regular"} />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  title="Replace Aria's photo"
                  disabled={uploadingPhoto}
                  className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-accent-700 transition-colors disabled:opacity-60"
                >
                  {uploadingPhoto ? (
                    <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  ) : (
                    <Pencil size={13} />
                  )}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePortraitFile(f);
                  }}
                />
              </>
            )}
            <button
              onClick={endInterview}
              title="End interview"
              className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Aria stage with user PiP */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portraitSrc}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallback !== "1") {
                  img.dataset.fallback = "1";
                  img.src = INTERVIEWER_PORTRAIT_FALLBACK;
                }
              }}
              alt="Aria the AI interviewer"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 22%" }}
            />

            {/* Top-left ready badge */}
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-500 text-white text-[10px] font-semibold shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              AI interviewer ready
            </div>

            {/* User picture-in-picture (only when stream active) */}
            {stream && (
              <div className="absolute bottom-3 right-3 w-28 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-black">
                {recording && (
                  <div className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-semibold">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    {minutes}:{seconds}
                  </div>
                )}
                <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
            )}

            {/* Bottom equalizer when speaking */}
            {speakingQuestion && (
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 text-white">
                <div className="flex items-end gap-0.5 h-3.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 bg-accent-400 rounded-full"
                      initial={{ height: 4 }}
                      animate={{ height: [4, 13, 5, 11, 4] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                      style={{ height: 4 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium">Aria is asking…</span>
              </div>
            )}
          </div>

          {/* Step header — like reference's "Step 2: Review interview context" */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center text-[10px]">
              {questionIndex + 1}
            </span>
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            {currentTurn?.evaluation && (
              <span className="ml-auto px-1.5 py-0.5 rounded bg-accent-50 text-accent-700 text-[10px] font-semibold normal-case">
                Answered · {currentTurn.evaluation.score}/100
              </span>
            )}
          </div>

          {/* Question text */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-zinc-950 leading-snug">"{currentQuestion}"</p>
          </div>

          {/* Camera permission helper */}
          {!stream && !permissionError && (
            <button
              onClick={startCamera}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <VideoCamera size={14} weight="fill" /> Start camera + microphone
            </button>
          )}
          {permissionError && (
            <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {permissionError}
            </p>
          )}

          {/* Recording controls */}
          {stream && (
            <div className="flex flex-wrap items-center gap-2">
              {!recording && !recordingUrl && (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
                >
                  <Play size={13} weight="fill" /> Record answer
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
              {recordingUrl && !recording && (
                <>
                  <button
                    onClick={() => {
                      discardRecording();
                      if (!stream) { startCamera(); return; }
                      startRecording();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 active:scale-[0.98] transition-all"
                  >
                    <ArrowClockwise size={13} weight="bold" /> Re-record
                  </button>
                  <button
                    onClick={discardRecording}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-zinc-600 border border-zinc-200 rounded-lg text-xs font-medium hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] transition-all"
                  >
                    <Trash size={13} /> Discard
                  </button>
                </>
              )}
            </div>
          )}

          {/* Transcript */}
          {(recordingUrl || transcript) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Your answer</div>
                <button
                  onClick={() => setEditingTranscript((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-950"
                >
                  <Pencil size={11} /> {editingTranscript ? "Done" : "Edit"}
                </button>
              </div>
              {editingTranscript ? (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={4}
                  placeholder="If transcription failed, paste or type your answer here…"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none"
                />
              ) : (
                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 rounded-lg px-3 py-2 min-h-[56px]">
                  {transcript || <span className="text-zinc-400 italic">Couldn't auto-transcribe — click Edit to type your answer.</span>}
                </p>
              )}
            </div>
          )}

          {/* Submit + nav */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => nextQuestion(-1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <CaretLeft size={12} /> Prev
            </button>
            <button
              onClick={evaluateAnswer}
              disabled={evaluating || transcript.trim().length < 5}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-500 text-white rounded-lg text-xs font-semibold hover:bg-accent-400 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {evaluating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Evaluating
                </>
              ) : (
                <>
                  <PaperPlaneRight size={12} weight="fill" /> Submit answer
                </>
              )}
            </button>
            <button
              onClick={() => nextQuestion(1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Next <CaretRight size={12} weight="bold" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Lightbulb size={12} weight="fill" className="text-amber-500" />
            Recordings stay in your browser
          </span>
          <button onClick={endInterview} className="font-medium text-red-500 hover:underline">
            End interview
          </button>
        </div>
      </div>

      {/* ── Right: Copilot Answers feed ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-950 flex items-center gap-2">
            <Sparkle size={15} weight="fill" className="text-accent-500" />
            Copilot Answers
          </h3>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-accent-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            {hasAnyAnswered ? "Live" : "Ready"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[calc(100vh-220px)]">
          {!hasAnyAnswered && !evaluating ? (
            <div className="text-center py-10">
              <ChatTeardropDots size={28} className="text-zinc-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-zinc-700">Aria is ready</div>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Click <span className="font-semibold text-zinc-700">Record answer</span> on the left, speak your reply,
                then submit. Aria's evaluations and your transcript will appear here, turn by turn.
              </p>
            </div>
          ) : (
            turns.map((turn, i) => {
              if (!turn.answer && i !== questionIndex) return null;
              if (!turn.answer && !turn.evaluation && !evaluating) return null;
              return (
                <FeedTurn
                  key={turn.id}
                  index={i + 1}
                  turn={turn}
                  portraitSrc={portraitSrc}
                  fallbackSrc={INTERVIEWER_PORTRAIT_FALLBACK}
                  fmtOffset={fmtOffset}
                  isCurrent={i === questionIndex}
                  evaluating={evaluating && i === questionIndex}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feed turn (chat-bubble row in Copilot Answers) ─────────────────────────

function FeedTurn({
  index,
  turn,
  portraitSrc,
  fallbackSrc,
  fmtOffset,
  isCurrent,
  evaluating,
}: {
  index: number;
  turn: InterviewTurn;
  portraitSrc: string;
  fallbackSrc: string;
  fmtOffset: (ms: number) => string;
  isCurrent: boolean;
  evaluating: boolean;
}) {
  const ev = turn.evaluation;
  return (
    <div className={`space-y-2 ${isCurrent ? "" : "opacity-90"}`}>
      {/* Aria's question bubble */}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitSrc}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback !== "1") {
                img.dataset.fallback = "1";
                img.src = fallbackSrc;
              }
            }}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 18%" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-1">
            <span className="font-semibold text-zinc-700">Aria</span>
            <span>·</span>
            <span>Q{index}</span>
            <span>·</span>
            <span className="tabular-nums">{fmtOffset(turn.askedAt)}</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <p className="text-[13px] text-zinc-800 leading-relaxed">{turn.question}</p>
          </div>
        </div>
      </div>

      {/* User answer bubble */}
      {turn.answer && (
        <div className="flex items-start gap-2 justify-end">
          <div className="flex-1 min-w-0 max-w-[88%]">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-1 justify-end">
              <span>You</span>
            </div>
            <div className="bg-accent-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{turn.answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation card */}
      {ev && (
        <div className="bg-zinc-950 text-white rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle size={13} weight="fill" className="text-accent-400" />
              <span className="text-xs font-semibold">Aria's feedback</span>
            </div>
            <div
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                ev.score >= 70
                  ? "bg-accent-500/20 text-accent-300"
                  : ev.score >= 40
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {ev.score} / 100
            </div>
          </div>
          <p className="text-[12px] text-white/85 leading-relaxed">{ev.verdict}</p>

          {ev.strengths?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-accent-300 uppercase tracking-wider mb-1">Strengths</div>
              <ul className="space-y-1">
                {ev.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-white/80">
                    <CheckCircle size={11} weight="fill" className="text-accent-400 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ev.improvements?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">Improvements</div>
              <ul className="space-y-1">
                {ev.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-white/80">
                    <Lightbulb size={11} weight="fill" className="text-amber-400 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ev.modelAnswer && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Sample strong answer</div>
              <p className="text-[11px] text-white/85 leading-relaxed italic">{ev.modelAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Evaluating placeholder */}
      {evaluating && !ev && (
        <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-accent-500 rounded-full animate-spin" />
          <span className="text-xs text-zinc-600">Aria is evaluating your answer…</span>
        </div>
      )}
    </div>
  );
}

// ─── My Skills panel ────────────────────────────────────────────────────────

function MySkillsPanel({ onLaunch }: { onLaunch: (target: LaunchTarget, topic: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/profile");
        if (!alive) return;
        const p = data?.data ?? {};
        setSkills(parseArr(p.skills));
        setTechnologies(parseArr(p.technologies));
      } catch {
        // Silent — empty state below covers the failure case
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-10 flex items-center justify-center gap-2 text-sm text-zinc-500">
        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
        Loading your skills…
      </div>
    );
  }

  const total = skills.length + technologies.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center">
        <Wrench size={28} className="text-zinc-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-zinc-950">No skills on your profile yet</h3>
        <p className="text-xs text-zinc-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Add skills and technologies to your profile, then come back here to drill into each one with an AI quiz or
          video interview.
        </p>
        <a
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          <Pencil size={12} weight="fill" /> Edit profile
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-5">
      <div className="flex items-start gap-2">
        <Sparkle size={16} weight="fill" className="text-accent-500 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-600 leading-relaxed">
          These topics come from your profile. Pick any one to launch a quiz on it, or jump straight into a video
          interview where Aria will ask you about it.
        </p>
      </div>

      {skills.length > 0 && <SkillSection title="Skills" items={skills} onLaunch={onLaunch} />}
      {technologies.length > 0 && (
        <SkillSection title="Technologies" items={technologies} onLaunch={onLaunch} />
      )}
    </div>
  );
}

function SkillSection({
  title,
  items,
  onLaunch,
}: {
  title: string;
  items: string[];
  onLaunch: (target: LaunchTarget, topic: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((skill) => (
          <div
            key={skill}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-800 truncate" title={skill}>
              {skill}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onLaunch("qa", skill)}
                title={`Start an AI quiz on ${skill}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-accent-700 bg-accent-50 hover:bg-accent-100 transition-colors"
              >
                <ChatTeardropDots size={11} weight="fill" /> Quiz
              </button>
              <button
                type="button"
                onClick={() => onLaunch("video", skill)}
                title={`Start a video interview on ${skill}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                <VideoCamera size={11} weight="fill" /> Interview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
