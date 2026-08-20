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
    <section className="mx-auto w-full max-w-3xl px-6 pb-6">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-md">
        <div className="bg-gradient-to-r from-[#0F2847] to-emerald-700 p-6 text-white">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Beta grátis
          </span>
          <h2 className="mt-3 text-2xl font-bold">Otimize seu currículo para esta vaga</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-100">
            A PonteCV reorganiza apenas informações verdadeiras do seu currículo e destaca o que é relevante para o processo seletivo.
          </p>
        </div>

        {status === "loading" ? (
          <p className="p-6 text-sm text-slate-500">Verificando sua versão otimizada…</p>
        ) : optimization ? (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Versão otimizada
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{optimization.title}</h3>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void copyResume()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300">
                  {copied ? "Copiado!" : "Copiar"}
                </button>
                <button type="button" onClick={downloadResume} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
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
          <div className="p-6">
            <p className="text-sm text-slate-600">
              Durante o beta, você recebe uma otimização incluída por análise de vaga.
            </p>
            <button
              type="button"
              disabled={status === "generating"}
              onClick={() => void generate()}
              className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

