"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/supabase/client";

type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

export function AnalysisFeedback({ analysisId }: { analysisId: string }) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<SaveStatus>("loading");

  useEffect(() => {
    let active = true;

    async function loadFeedback() {
      try {
        const session = await getSession();
        if (!session) {
          if (active) setStatus("idle");
          return;
        }

        const response = await fetch(`/api/analyses/${analysisId}/feedback`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) {
          if (active) setStatus("idle");
          return;
        }

        const data = (await response.json()) as {
          feedback: { helpful: boolean; comment: string | null } | null;
        };
        if (!active) return;

        if (data.feedback) {
          setHelpful(data.feedback.helpful);
          setComment(data.feedback.comment ?? "");
          setStatus("saved");
        } else {
          setStatus("idle");
        }
      } catch {
        if (active) setStatus("idle");
      }
    }

    void loadFeedback();
    return () => {
      active = false;
    };
  }, [analysisId]);

  async function saveFeedback() {
    if (helpful === null) return;
    setStatus("saving");

    try {
      const session = await getSession();
      if (!session) throw new Error("missing_session");

      const response = await fetch(`/api/analyses/${analysisId}/feedback`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ helpful, comment }),
      });

      if (!response.ok) throw new Error("save_failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function choose(value: boolean) {
    setHelpful(value);
    setStatus("idle");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Ajude a calibrar</p>
            <h2 className="mt-1.5 text-lg font-bold text-[#0F2847]">Esta análise foi útil?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sua resposta melhora a assertividade do Match Score.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-pressed={helpful === true}
            onClick={() => choose(true)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              helpful === true
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
            }`}
          >
            Sim, foi útil
          </button>
          <button
            type="button"
            aria-pressed={helpful === false}
            onClick={() => choose(false)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              helpful === false
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            Ainda não
          </button>
          </div>
        </div>

        {helpful !== null ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <label htmlFor="analysis-feedback-comment" className="text-sm font-medium text-slate-700">
              Conte o que acertou ou o que precisa melhorar (opcional)
            </label>
            <textarea
              id="analysis-feedback-comment"
              value={comment}
              maxLength={1000}
              rows={3}
              onChange={(event) => {
                setComment(event.target.value);
                setStatus("idle");
              }}
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ex.: a experiência foi identificada corretamente, mas a senioridade ficou baixa."
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={status === "saving"}
                onClick={() => void saveFeedback()}
                className="rounded-xl bg-[#0F2847] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "saving" ? "Salvando…" : "Salvar feedback"}
              </button>
              {status === "saved" ? (
                <span className="text-sm font-medium text-emerald-600">
                  Obrigado! Feedback salvo.
                </span>
              ) : null}
              {status === "error" ? (
                <span className="text-sm font-medium text-red-600">
                  Não foi possível salvar. Tente novamente.
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

