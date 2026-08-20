"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PonteCvLogo } from "@/components/brand/pontecv-logo";
import { getSession } from "@/lib/supabase/client";
import type { AnalysisListItem } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready"; analyses: AnalysisListItem[] };

export default function HistoryPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          setState({ status: "empty" });
          return;
        }

        const response = await fetch("/api/analyses", {
          headers: { Authorization: "Bearer " + session.access_token },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Não foi possível carregar suas análises.");
        }

        const analyses = data.analyses as AnalysisListItem[];
        setState(
          analyses.length > 0
            ? { status: "ready", analyses }
            : { status: "empty" },
        );
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar suas análises.",
        });
      }
    }

    void load();
  }, []);

  async function deleteAnalysis(analysis: AnalysisListItem) {
    const confirmed = window.confirm(
      "Excluir definitivamente esta análise e o texto extraído do currículo? Esta ação não pode ser desfeita.",
    );
    if (!confirmed) return;

    setDeletingId(analysis.id);
    try {
      const session = await getSession();
      if (!session) {
        throw new Error("Sessão não encontrada.");
      }

      const response = await fetch("/api/analyses/" + analysis.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + session.access_token },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível excluir a análise.");
      }

      if (state.status === "ready") {
        const remaining = state.analyses.filter(
          (item) => item.id !== analysis.id,
        );
        setState(
          remaining.length > 0
            ? { status: "ready", analyses: remaining }
            : { status: "empty" },
        );
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a análise.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="technical-grid min-h-svh px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <nav className="flex items-center justify-between">
          <PonteCvLogo showBadge={false} />
          <Link
            href="/"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700"
          >
            Nova análise
          </Link>
        </nav>

        <header className="pb-10 pt-16 sm:pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Seu progresso
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Minhas análises
          </h1>
          <p className="mt-4 max-w-xl text-neutral-600">
            Reabra resultados anteriores e acompanhe como seu currículo evolui
            para cada oportunidade.
          </p>
        </header>

        {state.status === "loading" && (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-800">{state.message}</p>
          </div>
        )}

        {state.status === "empty" && (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              %
            </div>
            <h2 className="mt-5 text-xl font-bold">Nenhuma análise por aqui ainda</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Faça sua primeira comparação para ver o histórico e reabrir o
              resultado quando quiser.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Analisar um currículo
            </Link>
          </div>
        )}

        {state.status === "ready" && (
          <div className="grid gap-4">
            {state.analyses.map((analysis) => (
              <article
                key={analysis.id}
                className="group grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <Link
                  href={"/analysis/" + analysis.id}
                  className="contents"
                  aria-label={"Abrir análise de " + (analysis.targetRole || analysis.originalName)}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-lg font-black text-emerald-400">
                    {analysis.score}%
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-neutral-900">
                      {analysis.targetRole || analysis.originalName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {analysis.targetRole
                        ? analysis.originalName + " · "
                        : ""}
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(analysis.createdAt))}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {analysis.hasJobMatch ? "Match da vaga" : "Nota geral"}
                  </span>
                  <button
                    type="button"
                    onClick={() => void deleteAnalysis(analysis)}
                    disabled={deletingId === analysis.id}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-neutral-400 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-50"
                  >
                    {deletingId === analysis.id ? "Excluindo…" : "Excluir"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
