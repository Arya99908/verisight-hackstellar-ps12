import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, FileSearch, Fingerprint, Image, QrCode, ShieldAlert, ShieldCheck } from "lucide-react";
import { fetchModelStatus, ModelStatus } from "../services/api";
import { AppRoute } from "./NavigationHeader";

interface WhyVerisightProps {
  onNavigateWorkbench: () => void;
}

const checks = [
  { icon: Image, title: "Pixel and compression cues", body: "ELA and wavelet summaries compare image residual patterns. Resizing and ordinary recompression can also change these patterns." },
  { icon: Fingerprint, title: "Repeated visual features", body: "ORB matching surfaces repeated regions for inspection. Repeated icons or interface elements may produce matches without editing." },
  { icon: FileSearch, title: "Text-like geometry", body: "Connected components and alignment are measured, but visible receipt words, amounts, and recipient names are not OCR-verified." },
  { icon: QrCode, title: "Metadata and QR payloads", body: "Supported metadata and QR contents can be displayed as cues. They are not checked against an issuer, bank, or payment provider." },
];

export const WhyVerisight: React.FC<WhyVerisightProps> = ({ onNavigateWorkbench }) => {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [statusUnavailable, setStatusUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetchModelStatus()
      .then((value) => { if (active) setStatus(value); })
      .catch(() => { if (active) setStatusUnavailable(true); });
    return () => { active = false; };
  }, []);

  const enter = reduceMotion
    ? { initial: false as const, whileInView: undefined }
    : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 } };

  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto bg-[#060911] text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.13),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.header {...enter} transition={{ duration: 0.45 }} viewport={{ once: true }} className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky-300">How VeriSight works</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Image review cues, shown with their limits.</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">VeriSight analyzes screenshot pixels and supported file metadata to surface regions that may merit closer inspection. It does not prove authenticity, identify who edited an image, or confirm that a payment settled.</p>
          <button onClick={onNavigateWorkbench} className="mt-7 inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 py-2.5 text-sm font-medium text-sky-200 transition hover:bg-sky-500/25">
            Open forensic workbench <ArrowRight className="h-4 w-4" />
          </button>
        </motion.header>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {checks.map(({ icon: Icon, title, body }, index) => (
            <motion.article key={title} {...enter} transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.07 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-[#0b1120]/90 p-5 shadow-xl shadow-black/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-300"><Icon className="h-5 w-5" /></div>
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </motion.article>
          ))}
        </section>

        <motion.section {...enter} transition={{ duration: 0.45 }} viewport={{ once: true }} className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-amber-400/20 bg-amber-950/15 p-5">
            <div className="flex items-center gap-2 text-amber-200"><ShieldAlert className="h-5 w-5" /><h2 className="font-semibold">What a scan can tell you</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-300">The report lists configured heuristic cues, heatmaps, and candidate regions. Ordinary image processing can trigger cues, and subtle edits may not be detected. Treat the result as a prompt for independent review.</p>
          </article>
          <article className="rounded-2xl border border-emerald-400/20 bg-emerald-950/10 p-5">
            <div className="flex items-center gap-2 text-emerald-200"><ShieldCheck className="h-5 w-5" /><h2 className="font-semibold">Current analyzer status</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{statusUnavailable ? "Status could not be loaded from the API." : status ? `${status.architecture}. ${status.message}` : "Loading status from the API…"}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-xs text-slate-400"><Activity className="h-3.5 w-3.5" />{status?.promotion_status ?? (statusUnavailable ? "STATUS UNAVAILABLE" : "CHECKING")}</p>
          </article>
        </motion.section>

        <motion.p {...enter} transition={{ duration: 0.45 }} viewport={{ once: true }} className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">VeriSight has no bank or payment-provider settlement connection. For payment confirmation, check the originating provider’s transaction history. No real-world accuracy or calibrated confidence is claimed unless supported by an authorized, representative, independently evaluated dataset.</motion.p>
      </div>
    </main>
  );
};
