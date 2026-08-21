"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/supabase/client";
import { ResultsView } from "@/components/analysis/results-view";
import { AnalysisFeedback } from "@/components/analysis/analysis-feedback";
import { ResumeOptimizer } from "@/components/analysis/resume-optimizer";
import { PonteCvLogo } from "@/components/brand/pontecv-logo";
import type { GetAnalysisResponse } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: GetAnalysisResponse };

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const analysisId = params.id;

  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const session = await getSession();
      if (!session) {
        setState({
          status: "error",
          message:
            "Sessão não encontrada. Volte à página inicial e envie o currículo novamente.",
        });
        return;
      }

      const res = await fetch(`/api/analyses/${analysisId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await res.json();

      if (res.status === 404) {
        setState({ status: "error", message: "Análise não encontrada." });
        return;
      }
      if (res.status === 403) {
        setState({
          status: "error",
          message: "Você não tem permissão para acessar esta análise.",
        });
        return;
      }
      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "Falha ao carregar a análise.",
        });
        return;
      }

      setState({ status: "ready", data: data as GetAnalysisResponse });
    } catch {
      setState({
        status: "error",
        message: "Falha ao carregar a análise. Tente novamente.",
      });
    }
  }, [analysisId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <main className="technical-grid flex min-h-svh flex-col items-center justify-center gap-5 px-6">
        <PonteCvLogo showBadge={false} />
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-lg shadow-slate-200/60">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="mt-4 font-semibold text-[#0F2847]">Montando seu diagnóstico…</p>
          <p className="mt-1 text-sm text-slate-400">Organizando notas, evidências e prioridades.</p>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="technical-grid flex min-h-svh items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M12 8v5m0 3.5v.5M4.9 19h14.2a2 2 0 0 0 1.74-3L13.74 3.7a2 2 0 0 0-3.48 0L3.16 16A2 2 0 0 0 4.9 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#0F2847]">Não conseguimos abrir a análise</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{state.message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => void load()} className="rounded-xl bg-[#0F2847] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Tentar novamente
            </button>
            <Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              Nova análise
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="technical-grid min-h-svh">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <PonteCvLogo />
          <nav className="flex items-center gap-2" aria-label="Navegação da análise">
            <Link href="/history" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#0F2847] sm:inline-flex">
              Meu histórico
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#0F2847] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Nova análise
            </Link>
          </nav>
        </div>
      </header>

      <ResultsView locked={state.data.locked} analysis={state.data.analysis} />
      {!state.data.locked && state.data.analysis.jobMatch ? (
        <ResumeOptimizer analysisId={analysisId} />
      ) : null}
      <AnalysisFeedback analysisId={analysisId} />

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>PonteCV · Diagnóstico orientativo para candidaturas na Europa.</p>
          <p>A decisão final pertence sempre ao recrutador.</p>
        </div>
      </footer>
    </main>
  );
}

