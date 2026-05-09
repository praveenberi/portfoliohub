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
} from "@phosphor-icons/react";
import axios from "axios";
import toast from "react-hot-toast";

// Stable AI-rendered portrait of "Aria" the virtual interviewer. Pollinations
// is keyed by prompt + seed, so this URL always resolves to the same image.
const INTERVIEWER_PORTRAIT_URL = (() => {
  const prompt = "young south asian indian woman interviewer in her late twenties, long flowing dark wavy hair, warm friendly soft smile, black blazer over crisp white shirt, delicate gold pendant necklace, modern office interior with soft warm lamp light and framed art on wall, photorealistic dslr portrait, sharp focus on face, looking directly at camera, professional headshot";
  const params = new URLSearchParams({ width: "768", height: "768", seed: "12451", nologo: "true", enhance: "true" });
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

type Tab = "qa" | "video";

export function MockInterview() {
  const [tab, setTab] = useState<Tab>("qa");

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

      {tab === "qa" && <AIQuizPanel />}
      {tab === "video" && <VideoInterviewPanel />}
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

function AIQuizPanel() {
  const [topic, setTopic] = useState("React (hooks, performance, state management)");
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

function VideoInterviewPanel() {
  const [topic, setTopic] = useState("Behavioural interview questions using STAR framework");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

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

  const currentQuestion = questions[questionIndex] ?? "";
  const hasInterview = questions.length > 0;

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
      setQuestions(qs);
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
    setQuestions([]);
    setQuestionIndex(0);
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
    const total = questions.length;
    if (total === 0) return;
    setQuestionIndex((i) => (i + delta + total) % total);
    resetForNewQuestion();
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

  function speakQuestion() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentQuestion);
    utter.rate = 0.95;
    utter.pitch = 1;
    // Prefer an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => /en-(US|GB)/i.test(v.lang)) ?? voices[0];
    if (enVoice) utter.voice = enVoice;
    utter.onstart = () => setSpeakingQuestion(true);
    utter.onend = () => setSpeakingQuestion(false);
    utter.onerror = () => setSpeakingQuestion(false);
    window.speechSynthesis.speak(utter);
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
      setEvaluation(data?.data ?? null);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to evaluate";
      toast.error(msg);
    } finally {
      setEvaluating(false);
    }
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

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Virtual interviewer + question */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
          {/* Header: small portrait + name */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-accent-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={INTERVIEWER_PORTRAIT_URL} alt="Aria" className="w-full h-full object-cover" />
              {speakingQuestion && (
                <motion.span
                  className="absolute inset-0 rounded-full ring-2 ring-accent-400"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-950">Aria · AI Interviewer</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Question {questionIndex + 1} of {questions.length}
              </div>
            </div>
            <button
              onClick={speakQuestion}
              title="Hear the question again"
              className="ml-auto w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-accent-700 transition-colors"
            >
              <SpeakerHigh size={14} weight={speakingQuestion ? "fill" : "regular"} />
            </button>
          </div>

          {/* Question text — speech-bubble style */}
          <div className="relative bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-zinc-950 leading-snug">"{currentQuestion}"</p>
          </div>

          {/* Big portrait of the virtual interviewer, animated while speaking */}
          <button
            type="button"
            onClick={speakQuestion}
            title={speakingQuestion ? "Aria is speaking" : "Tap to hear the question"}
            className="relative block w-full aspect-square rounded-xl overflow-hidden bg-zinc-100 group"
          >
            {/* Portrait — breathes & sways while speaking to fake liveness */}
            <motion.div
              className="absolute inset-0"
              animate={
                speakingQuestion
                  ? { scale: [1, 1.012, 0.998, 1.01, 1], rotate: [-0.25, 0.3, -0.2, 0.25, -0.25] }
                  : { scale: [1, 1.004, 1], rotate: 0 }
              }
              transition={{
                duration: speakingQuestion ? 2.4 : 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={INTERVIEWER_PORTRAIT_URL}
                alt="Aria the AI interviewer"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Mouth-area indicator — a soft jaw shadow that opens/closes on the
                lower-third of the face. Roughly aligned to portrait composition;
                positioned just above the chin and centred horizontally. */}
            {speakingQuestion && (
              <motion.span
                aria-hidden
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: "50%",
                  top: "62%",
                  width: "11%",
                  background: "rgba(20,10,8,0.32)",
                  filter: "blur(1.5px)",
                  transformOrigin: "center",
                }}
                animate={{
                  height: ["1.8%", "3.4%", "1.4%", "3.0%", "1.8%"],
                  opacity: [0.5, 0.85, 0.45, 0.8, 0.5],
                  x: "-50%",
                  y: "-50%",
                }}
                transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Periodic blink — eye-area dim every ~4 seconds */}
            <motion.span
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "38%",
                width: "44%",
                height: "3.2%",
                background: "rgba(0,0,0,0.55)",
                filter: "blur(2px)",
                borderRadius: "999px",
                transform: "translate(-50%, -50%) scaleY(0)",
              }}
              animate={{ scaleY: [0, 0, 1, 0, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, times: [0, 0.92, 0.96, 0.99, 1], ease: "easeInOut" }}
            />

            {/* Speaking pulse ring */}
            {speakingQuestion && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 ring-4 ring-accent-400 rounded-xl pointer-events-none"
                  animate={{ opacity: [0.7, 0.2, 0.7] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  aria-hidden
                  className="absolute -inset-1 rounded-2xl pointer-events-none"
                  style={{ boxShadow: "0 0 0 0 rgba(34,197,94,0.45)" }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(34,197,94,0.45)", "0 0 0 14px rgba(34,197,94,0)"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              </>
            )}

            {/* Speaking equalizer at the bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 bg-accent-400 rounded-full"
                    initial={{ height: 4 }}
                    animate={{ height: speakingQuestion ? [4, 14, 6, 12, 4] : 4 }}
                    transition={{
                      duration: 0.9,
                      repeat: speakingQuestion ? Infinity : 0,
                      ease: "easeInOut",
                      delay: i * 0.08,
                    }}
                    style={{ height: 4 }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-white/85">
                {speakingQuestion ? "Aria is asking…" : "Tap to replay"}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
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

        <button
          onClick={endInterview}
          className="w-full text-xs font-medium text-zinc-500 hover:text-red-600 hover:underline"
        >
          End interview
        </button>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-amber-600 mt-0.5 shrink-0" weight="fill" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Recordings stay <span className="font-semibold">in your browser</span> — only the typed/transcribed
              answer is sent to the AI for grading.
            </p>
          </div>
        </div>
      </div>

      {/* Camera + recording + evaluation */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200">
          {recordingUrl ? (
            <video src={recordingUrl} controls className="w-full h-full object-contain bg-black" />
          ) : stream ? (
            <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
              <VideoCamera size={42} className="text-white/30 mb-3" />
              <div className="text-sm font-semibold text-white/90">Camera preview</div>
              <p className="text-xs text-white/50 mt-1 max-w-sm">
                {permissionError ?? "Click Start camera to begin. Your browser will ask for camera + microphone permission."}
              </p>
              <button
                onClick={startCamera}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-400 active:scale-[0.98] transition-all"
              >
                <VideoCamera size={14} weight="fill" /> Start camera
              </button>
            </div>
          )}
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

        {/* Transcript + evaluate */}
        {(recordingUrl || transcript) && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-700">Your answer (transcript)</div>
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
                rows={5}
                placeholder="If transcription failed, paste or type your answer here…"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none"
              />
            ) : (
              <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 rounded-lg px-3 py-2 min-h-[64px]">
                {transcript || <span className="text-zinc-400 italic">Couldn't auto-transcribe — click Edit to type your answer manually before evaluating.</span>}
              </p>
            )}

            <button
              onClick={evaluateAnswer}
              disabled={evaluating || transcript.trim().length < 5}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent-500 text-white rounded-lg text-xs font-semibold hover:bg-accent-400 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {evaluating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Evaluating
                </>
              ) : (
                <>
                  <PaperPlaneRight size={12} weight="fill" /> Submit for AI evaluation
                </>
              )}
            </button>

            <AnimatePresence>
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-950 text-white rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkle size={14} weight="fill" className="text-accent-400" />
                      <span className="text-sm font-semibold">AI feedback</span>
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      evaluation.score >= 70 ? "bg-accent-500/20 text-accent-300"
                      : evaluation.score >= 40 ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                    }`}>
                      {evaluation.score} / 100
                    </div>
                  </div>
                  <p className="text-xs text-white/85 leading-relaxed">{evaluation.verdict}</p>

                  {evaluation.strengths?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-accent-300 uppercase tracking-wider mb-1">Strengths</div>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-white/80">
                            <CheckCircle size={11} weight="fill" className="text-accent-400 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.improvements?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">Improvements</div>
                      <ul className="space-y-1">
                        {evaluation.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-white/80">
                            <Lightbulb size={11} weight="fill" className="text-amber-400 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.modelAnswer && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Sample strong answer</div>
                      <p className="text-[12px] text-white/85 leading-relaxed italic">{evaluation.modelAnswer}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
