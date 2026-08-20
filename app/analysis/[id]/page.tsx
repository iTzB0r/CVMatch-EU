"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/supabase/client";
import { ResultsView } from "@/components/analysis/results-view";
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
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-neutral-500">Carregando sua análise…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-neutral-900">{state.message}</p>
        <Link href="/" className="text-emerald-600 hover:underline">
          Voltar à página inicial
        </Link>
      </main>
    );
  }

  return <ResultsView locked={state.data.locked} analysis={state.data.analysis} />;
}

