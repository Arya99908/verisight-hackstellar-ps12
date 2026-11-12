import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  HelpCircle,
  FileText,
  Volume2,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Building2,
  Hash,
  User,
  Phone,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExtractedIncidentDetails,
  DynamicQuestion,
  UnderstandIncidentResponse,
  AttachedForensicContext,
} from "../../types/response";
import { understandIncident } from "../../services/api";

interface VoiceReportingAssistantProps {
  onProceedToBuilder: (details: ExtractedIncidentDetails) => void;
  attachedForensicContext?: AttachedForensicContext | null;
  initialCategoryHint?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "English (India)", short: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)", short: "Hindi" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)", short: "Kannada" },
  { code: "bn-IN", label: "বাংলা (Bengali)", short: "Bengali" },
  { code: "ta-IN", label: "தமிழ் (Tamil)", short: "Tamil" },
  { code: "te-IN", label: "తెలుగు (Telugu)", short: "Telugu" },
  { code: "mr-IN", label: "मराठी (Marathi)", short: "Marathi" },
];

export const VoiceReportingAssistant: React.FC<VoiceReportingAssistantProps> = ({
  onProceedToBuilder,
  attachedForensicContext,
  initialCategoryHint,
}) => {
  // Speech & Recording States
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micPermission, setMicPermission] = useState<"IDLE" | "REQUESTING" | "GRANTED" | "DENIED">("IDLE");
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  // Transcript & Analysis States
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<UnderstandIncidentResponse | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<DynamicQuestion | null>(null);
  const [conversationLog, setConversationLog] = useState<Array<{ sender: "USER" | "ASSISTANT"; text: string }>>([]);
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initial welcome message from assistant
  useEffect(() => {
    if (conversationLog.length === 0) {
      const initialAssistantMessage = attachedForensicContext
        ? `I have imported your Forensic Workbench analysis for "${attachedForensicContext.filename}" (SHA-256: ${attachedForensicContext.file_sha256.slice(0, 10)}...). Please speak or write: What happened in this transaction? Did you send or receive money?`
        : "Welcome to VeriSight Incident Response. Please press the microphone and describe what happened in your own words (e.g. 'I sold a phone and received a fake payment screenshot' or '₹18,000 was debited from my account').";

      setConversationLog([{ sender: "ASSISTANT", text: initialAssistantMessage }]);
    }
  }, [attachedForensicContext, conversationLog.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Live Canvas Waveform Render
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / 32) - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        // Average magnitude across a frequency slice
        const value = dataArray[i * 2] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * canvas.height);

        // Smooth aesthetic cyan to emerald gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "#38bdf8");
        gradient.addColorStop(1, "#0284c7");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, []);

  // Request Microphone and Start AudioContext
  const startRecording = async () => {
    try {
      setMicPermission("REQUESTING");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("GRANTED");

      // Set up AudioContext for waveform
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Start MediaRecorder
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Start waveform loop
      drawWaveform();

      // Start Web Speech API SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguage;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript((prev) => {
              // Append or update live transcript
              const prefix = prev ? `${prev} ` : "";
              return `${prefix}${currentTranscript}`.replace(/\s+/g, " ");
            });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("[WebSpeech Warning]", e.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } else {
        toast("Browser live speech-to-text not fully supported. You can type directly in the transcription box.");
      }

      toast.success("Recording started. Please speak clearly.");
    } catch (err) {
      console.error(err);
      setMicPermission("DENIED");
      toast.error("Microphone permission was denied. You can still type your statement directly.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      toast("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (_) {}
      }
      toast("Recording resumed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      toast.success("Voice recording captured.");
    }
  };

  const deleteRecording = () => {
    stopRecording();
    setAudioBlobUrl(null);
    setTranscript("");
    setRecordingSeconds(0);
    toast("Audio recording deleted");
  };

  // Replay audio
  const togglePlayAudio = () => {
    if (!audioBlobUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioBlobUrl);
      audioPlayerRef.current.onended = () => setIsPlayingBack(false);
    }
    if (isPlayingBack) {
      audioPlayerRef.current.pause();
      setIsPlayingBack(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingBack(true);
    }
  };

  // Run NLU on transcript
  const handleAnalyzeTranscript = async (textToAnalyze?: string) => {
    const text = textToAnalyze || transcript;
    if (!text.trim()) {
      toast.error("Please record audio or type an incident description first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const existing = analysisResponse?.extracted_details;
      const res = await understandIncident({
        user_text: text,
        language: selectedLanguage.split("-")[0],
        existing_details: existing,
        attached_forensic_summary: attachedForensicContext
          ? {
              file_sha256: attachedForensicContext.file_sha256,
              filename: attachedForensicContext.filename,
              overall_tamper_score: attachedForensicContext.overall_tamper_score,
              verdict: attachedForensicContext.verdict,
              findings: attachedForensicContext.findings,
              synergy: attachedForensicContext.synergy,
            }
          : undefined,
      });

      setAnalysisResponse(res);
      setActiveQuestion(res.next_question || null);

      // Add user text and assistant response to conversation log
      setConversationLog((prev) => [
        ...prev,
        { sender: "USER", text },
        ...(res.next_question
          ? [{ sender: "ASSISTANT" as const, text: res.next_question.question }]
          : [
              {
                sender: "ASSISTANT" as const,
                text: "Thank you. I have extracted the core details of your incident. You can review the structured facts below or proceed to generate your formal complaint.",
              },
            ]),
      ]);

      toast.success(`Classified as ${res.extracted_details.incident_category_label}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze incident text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle answering dynamic follow-up question
  const handleAnswerQuestion = async (answerText: string) => {
    if (!answerText.trim()) return;
    setFollowUpAnswer("");
    const combinedText = `${transcript} Answer to question (${activeQuestion?.question}): ${answerText}`;
    setTranscript(combinedText);
    await handleAnalyzeTranscript(combinedText);
  };

  // Format recording seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ------------------------------------------------------------- */}
      {/* Left Column: Voice Recording Studio & Conversational Feed (7 cols) */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-7 space-y-4">
        {/* Recording Studio Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E1A]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
          {/* Header & Language Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400">
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-100">
                  Voice-to-Complaint Intelligence
                </h3>
                <span className="font-mono text-[10px] text-slate-400">
                  Active Capture Engine: Web Speech & Audio Analyser
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="rounded-lg border border-white/10 bg-[#060A14] px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy & Consent Notice */}
          <div className="flex items-start gap-2.5 rounded-lg border border-sky-500/20 bg-sky-950/20 px-3 py-2 text-[11px] text-sky-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
            <p className="leading-relaxed font-sans">
              Audio is not uploaded to VeriSight by this feature; only the recognized or typed transcript is sent for rule-based extraction. Browser speech recognition may process audio according to your browser provider&apos;s privacy practices. You can type instead.
            </p>
          </div>

          {/* Live Waveform Canvas & Timer Area */}
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#060911] p-4 min-h-[110px]">
            {isRecording ? (
              <canvas
                ref={canvasRef}
                width={320}
                height={55}
                className="w-full max-w-xs h-14"
              />
            ) : audioBlobUrl ? (
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-300">
                  Voice recording ready for replay and analysis
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-500 space-y-1">
                <Mic className="h-6 w-6 stroke-[1.5]" />
                <span className="font-mono text-[11px]">
                  Press "Start Recording" to capture your incident description
                </span>
              </div>
            )}

            {/* Duration Display */}
            {(isRecording || audioBlobUrl) && (
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isRecording ? "bg-rose-400" : "bg-emerald-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isRecording ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                </span>
                <span className="font-mono text-xs font-bold tabular-nums text-slate-300">
                  {formatTime(recordingSeconds)}
                </span>
                {isPaused && (
                  <span className="rounded bg-amber-950 px-1.5 py-0.2 font-mono text-[9px] text-amber-300 border border-amber-800">
                    PAUSED
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Recording Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-500 active:scale-[0.98]"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-[0.98]"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop Recording</span>
                </button>

                {!isPaused ? (
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-slate-300 hover:bg-white/10 active:scale-[0.98]"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeRecording}
                    className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-2 font-mono text-xs text-amber-300 hover:bg-amber-500/30 active:scale-[0.98]"
                  >
                    <Play className="h-4 w-4 fill-amber-300" />
                    <span>Resume</span>
                  </button>
                )}
              </>
            )}

            {audioBlobUrl && !isRecording && (
              <>
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-2 font-mono text-xs text-emerald-300 hover:bg-emerald-500/30 active:scale-[0.98]"
                >
                  {isPlayingBack ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Replay</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Replay Audio</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={deleteRecording}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 font-mono text-xs text-rose-300 hover:bg-rose-900/60 active:scale-[0.98]"
                  title="Delete Recording"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>

          {/* Editable Transcription Input */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Live Transcription (Editable)
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                You can freely edit or type additional details below
              </span>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your voice transcription will appear here in real time. You can also paste or type the incident details directly..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-[#060911] p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none font-sans"
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleAnalyzeTranscript()}
                disabled={isAnalyzing || !transcript.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAnalyzing ? "Understanding Incident..." : "Analyze Incident & Extract Facts"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conversational Questions & Assistant Interaction */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E1A]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-100">
              Interactive Incident Dialogue
            </h3>
          </div>

          {/* Conversation Messages */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {conversationLog.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs ${
                  msg.sender === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ASSISTANT" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-950/60 text-sky-400 font-mono text-[10px] font-bold">
                    VS
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed font-sans ${
                    msg.sender === "USER"
                      ? "bg-sky-600 text-white rounded-tr-none shadow-sm"
                      : "border border-white/[0.08] bg-[#0E1528] text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Active Dynamic Question Prompt */}
          {activeQuestion && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3.5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-sky-300 bg-sky-900/60 px-2 py-0.5 rounded border border-sky-700/50">
                  {activeQuestion.urgency === "URGENT_PROTECTIVE" ? "URGENT PROTECTIVE CHECK" : "FOLLOW-UP QUESTION"}
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  Field: {activeQuestion.field_targeted}
                </span>
              </div>

              <p className="text-xs font-semibold text-white font-sans">
                {activeQuestion.question}
              </p>

              {/* Quick option pills */}
              {activeQuestion.options && activeQuestion.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswerQuestion(opt)}
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-sans text-sky-200 hover:bg-sky-500/25 active:scale-[0.98] transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Freeform answer input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleAnswerQuestion(followUpAnswer);
                    }
                  }}
                  placeholder="Or type/speak your answer..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#060911] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAnswerQuestion(followUpAnswer)}
                  className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 active:scale-[0.98]"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Right Column: Structured Incident Intelligence HUD (5 cols)   */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-5 space-y-4">
        {/* Extracted Details Dossier Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0E1A]/90 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-100">
                Extracted Incident Intelligence
              </h3>
            </div>
            {analysisResponse && (
              <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[9px] font-bold text-sky-300 border border-sky-800/40">
                RULE-BASED DRAFT · REVIEW FIELDS
              </span>
            )}
          </div>

          {/* Urgent Alert Banner if present */}
          {analysisResponse?.urgent_alerts && analysisResponse.urgent_alerts.length > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-300 font-mono text-[10px] font-bold uppercase">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Urgent Protective Guidance</span>
              </div>
              <ul className="text-xs text-rose-200/90 space-y-1 font-sans pl-1">
                {analysisResponse.urgent_alerts.map((alert, i) => (
                  <li key={i} className="leading-snug">
                    • {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Key-Value Grid */}
          <div className="space-y-2.5 font-mono text-xs">
            {/* Category */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">CATEGORY</span>
              <span className="font-semibold text-sky-300 text-right truncate max-w-[200px]">
                {analysisResponse?.extracted_details.incident_category_label || initialCategoryHint || "Pending Input"}
              </span>
            </div>

            {/* Financial Loss */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">FINANCIAL LOSS</span>
              <span className="font-semibold text-slate-100">
                {analysisResponse?.extracted_details.financial_loss_amount !== undefined &&
                analysisResponse.extracted_details.financial_loss_amount !== null
                  ? `₹${analysisResponse.extracted_details.financial_loss_amount.toLocaleString()}`
                  : analysisResponse?.extracted_details.financial_impact === "NO_MONEY_LOST"
                  ? "₹0.00 (Zero Loss / Prevented)"
                  : "Unspecified"}
              </span>
            </div>

            {/* Txn Reference UTR */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">TRANSACTION UTR / REF</span>
              <span className="font-semibold text-slate-200">
                {analysisResponse?.extracted_details.transaction_reference || (
                  <span className="text-amber-400 text-[10px]">Missing</span>
                )}
              </span>
            </div>

            {/* Bank / PSP */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">BANK / UPI APP</span>
              <span className="font-semibold text-slate-200">
                {analysisResponse?.extracted_details.bank_or_upi_provider || (
                  <span className="text-amber-400 text-[10px]">Missing</span>
                )}
              </span>
            </div>

            {/* Suspected VPA / Phone */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">SUSPECT VPA / PHONE</span>
              <span className="font-semibold text-slate-200 truncate max-w-[190px]">
                {analysisResponse?.extracted_details.suspected_vpa ||
                  analysisResponse?.extracted_details.suspected_phone || (
                    <span className="text-amber-400 text-[10px]">Unidentified</span>
                  )}
              </span>
            </div>

            {/* Communication Channel */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C1222] p-2.5">
              <span className="text-[10px] text-slate-400">COMMUNICATION CHANNEL</span>
              <span className="font-semibold text-slate-200">
                {analysisResponse?.extracted_details.communication_channel || "Digital"}
              </span>
            </div>
          </div>

          {/* Missing Fields Audit Checklist */}
          {analysisResponse?.extracted_details.missing_fields &&
            analysisResponse.extracted_details.missing_fields.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Recommended Missing Items:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResponse.extracted_details.missing_fields.map((field) => (
                    <span
                      key={field}
                      className="rounded bg-amber-950/60 px-2 py-0.5 font-mono text-[9px] text-amber-200 border border-amber-800/40"
                    >
                      {field.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Attached Forensic Evidence Badge */}
          {attachedForensicContext && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-sky-300 font-semibold">WORKBENCH EVIDENCE LINKED</span>
                <span className="text-sky-400">{attachedForensicContext.verdict}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                File: {attachedForensicContext.filename} (Heuristic points: {attachedForensicContext.overall_tamper_score.toFixed(1)}/100)
              </p>
            </div>
          )}

          {/* Proceed to Complaint Builder Button */}
          <button
            type="button"
            onClick={() => {
              if (analysisResponse?.extracted_details) {
                onProceedToBuilder(analysisResponse.extracted_details);
              } else if (transcript.trim()) {
                void handleAnalyzeTranscript().then(() => {
                  if (analysisResponse?.extracted_details) {
                    onProceedToBuilder(analysisResponse.extracted_details);
                  }
                });
              } else {
                toast.error("Please provide or record your incident details first.");
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-mono text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98]"
          >
            <span>Proceed to Formal Complaint Builder</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
