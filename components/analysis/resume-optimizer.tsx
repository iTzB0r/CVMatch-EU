"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/supabase/client";
import type { ResumeOptimization } from "@/lib/validations/resume-optimization";

type Status = "loading" | "idle" | "generating" | "ready" | "error";

export function ResumeOptimizer({ analysisId }: { analysisId: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const session = await getSession();
        if (!session) throw new Error("missing_session");
        const response = await fetch(`/api/analyses/${analysisId}/optimize`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("load_failed");
        const data = (await response.json()) as { optimization: ResumeOptimization | null };
        if (!active) return;
        setOptimization(data.optimization);
        setStatus(data.optimization ? "ready" : "idle");
      } catch {
        if (active) setStatus("idle");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [analysisId]);

  async function generate() {
    setStatus("generating");
    setMessage("");
    try {
      const session = await getSession();
      if (!session) throw new Error("missing_session");
      const response = await fetch(`/api/analyses/${analysisId}/optimize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json()) as {
        optimization?: ResumeOptimization;
        error?: string;
      };
      if (!response.ok || !data.optimization) {
        throw new Error(data.error || "Falha ao otimizar.");
      }
      setOptimization(data.optimization);
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao otimizar.");
      setStatus("error");
    }
  }

  async function copyResume() {
    if (!optimization) return;
    await navigator.clipboard.writeText(optimization.optimizedResume);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function downloadResume() {
    if (!optimization) return;
    const blob = new Blob([optimization.optimizedResume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "curriculo-otimizado-pontecv.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,40,71,0.7)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2847] via-[#12375f] to-emerald-800 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                  Próximo passo
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                  Beta grátis
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Transforme o diagnóstico em um currículo melhor</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                A PonteCV reorganiza apenas informações verdadeiras e aproxima seu currículo da linguagem da vaga, sem inventar competências.
              </p>
            </div>
            <div className="hidden h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.07] lg:grid">
              <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-emerald-300" aria-hidden="true">
                <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M14 3.5V8h4M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {status === "loading" ? (
          <div className="flex items-center gap-3 p-6 text-sm text-slate-500 sm:p-8">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
            Verificando sua versão otimizada…
          </div>
        ) : optimization ? (
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Versão otimizada
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{optimization.title}</h3>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void copyResume()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                  {copied ? "Copiado!" : "Copiar"}
                </button>
                <button type="button" onClick={downloadResume} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md">
                  Baixar TXT
                </button>
              </div>
            </div>

            <pre className="mt-5 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 font-sans text-sm leading-6 text-slate-800">
              {optimization.optimizedResume}
            </pre>

            {optimization.changeLog.length > 0 ? (
              <div className="mt-5">
                <h4 className="font-semibold text-slate-900">O que foi melhorado</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {optimization.changeLog.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : null}

            {optimization.gapsNotAdded.length > 0 ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-semibold text-amber-900">Lacunas que não foram inventadas</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {optimization.gapsNotAdded.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Durante o beta, você recebe uma otimização incluída por análise de vaga.
            </p>
            <button
              type="button"
              disabled={status === "generating"}
              onClick={() => void generate()}
              className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "generating" ? "Otimizando… pode levar alguns segundos" : "Gerar currículo otimizado"}
            </button>
            {status === "error" ? (
              <p className="mt-3 text-sm font-medium text-red-600">{message}</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

