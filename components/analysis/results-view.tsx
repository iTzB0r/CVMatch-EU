"use client";

import type { ReactNode } from "react";
import type { ResumeAnalysis } from "@/lib/validations/resume-analysis";
import type { AnalysisPreview } from "@/lib/types";

type Band = "green" | "amber" | "red";

function bandOf(score: number): Band {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

const bandStyles: Record<Band, string> = {
  green: "text-emerald-600 ring-emerald-200 bg-emerald-50",
  amber: "text-amber-600 ring-amber-200 bg-amber-50",
  red: "text-red-600 ring-red-200 bg-red-50",
};

const severityStyles: Record<"low" | "medium" | "high", string> = {
  low: "bg-neutral-100 text-neutral-600",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-700",
};

const categoryLabels = {
  technical: "Competências técnicas",
  experience: "Experiência relevante",
  mandatory: "Requisitos obrigatórios",
  seniority: "Senioridade",
  language_location: "Idioma e localização",
  education: "Formação e certificações",
} as const;

const matchStatus = {
  matched: { label: "Atendido", style: "bg-emerald-100 text-emerald-700" },
  partial: { label: "Parcial", style: "bg-amber-100 text-amber-800" },
  missing: { label: "Ausente", style: "bg-red-100 text-red-700" },
} as const;

function ScoreCard({
  label,
  score,
  big = false,
}: {
  label: string;
  score: number;
  big?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-5 ring-1 ${bandStyles[bandOf(score)]} ${big ? "col-span-2 sm:col-span-1" : ""}`}
    >
      <span className={`font-bold ${big ? "text-5xl" : "text-3xl"}`}>{score}</span>
      <span className={`text-center font-medium ${big ? "text-sm" : "text-xs"}`}>
        {label}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-neutral-400">{children}</p>;
}

function JobMatchSection({
  jobMatch,
}: {
  jobMatch: NonNullable<ResumeAnalysis["jobMatch"]>;
}) {
  const totals = jobMatch.requirements.reduce(
    (result, item) => ({
      ...result,
      [item.status]: result[item.status] + 1,
    }),
    { matched: 0, partial: 0, missing: 0 },
  );

  return (
    <Section title="Compatibilidade CV × vaga">
      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <div className={`flex flex-col items-center justify-center rounded-2xl p-5 ring-1 ${bandStyles[bandOf(jobMatch.score)]}`}>
          <span className="text-5xl font-bold">{jobMatch.score}%</span>
          <span className="mt-1 text-center text-xs font-medium">
            compatibilidade calculada
          </span>
        </div>
        <div>
          {jobMatch.targetRole ? (
            <p className="font-semibold text-neutral-900">{jobMatch.targetRole}</p>
          ) : null}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <strong className="block text-xl">{totals.matched}</strong> atendidos
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-800">
              <strong className="block text-xl">{totals.partial}</strong> parciais
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-700">
              <strong className="block text-xl">{totals.missing}</strong> ausentes
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            A IA extrai os requisitos e as evidências; a porcentagem é calculada
            no servidor com pesos fixos e requisitos obrigatórios valendo mais.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {jobMatch.breakdown.map((item) => (
          <div key={item.category} className="rounded-xl bg-neutral-50 p-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-neutral-700">
                {categoryLabels[item.category]}
              </span>
              <strong className="text-neutral-900">{item.score}%</strong>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Peso {item.weight}% · {item.requirements} requisito(s)
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {jobMatch.requirements.map((item, index) => (
          <article key={`${item.requirement}-${index}`} className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900">{item.requirement}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {categoryLabels[item.category]} · {item.importance === "required" ? "obrigatório" : "desejável"}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${matchStatus[item.status].style}`}>
                {matchStatus[item.status].label}
              </span>
            </div>
            {item.evidence ? (
              <p className="mt-3 border-l-2 border-emerald-300 pl-3 text-sm text-neutral-600">
                <span className="font-medium text-neutral-700">Evidência:</span>{" "}
                {item.evidence}
              </p>
            ) : null}
            {item.recommendation ? (
              <p className="mt-2 text-sm text-neutral-600">
                <span className="font-medium text-neutral-700">Ação:</span>{" "}
                {item.recommendation}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  );
}

function FullSections({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <>
      {/* Pontos fortes */}
      <Section title="Pontos fortes">
        {analysis.strengths.length === 0 ? (
          <Empty>Nenhum ponto forte identificado.</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-neutral-700">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Recomendações */}
      <Section title="Recomendações de melhoria">
        {analysis.recommendations.length === 0 ? (
          <Empty>Nenhuma recomendação no momento.</Empty>
        ) : (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-neutral-700">
            {analysis.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        )}
      </Section>

      {/* Palavras-chave */}
      <Section title="Palavras-chave">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Presentes no currículo
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.present.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Faltando (importantes para o mercado)
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.missing.length === 0 ? (
                <Empty>Nenhuma palavra-chave ausente identificada.</Empty>
              ) : (
                analysis.keywords.missing.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-200"
                  >
                    {k}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Experiências pouco valorizadas */}
      <Section title="Experiências pouco valorizadas">
        {analysis.underratedExperience.length === 0 ? (
          <Empty>Nenhuma experiência subutilizada identificada.</Empty>
        ) : (
          <ul className="flex flex-col gap-2 text-neutral-700">
            {analysis.underratedExperience.map((e, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                {e}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Problemas de formatação */}
      <Section title="Possíveis erros de formatação">
        {analysis.formattingIssues.length === 0 ? (
          <Empty>Nenhum problema de formatação identificado.</Empty>
        ) : (
          <ul className="flex flex-col gap-2 text-neutral-700">
            {analysis.formattingIssues.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

export function ResultsView({
  locked,
  analysis,
}: {
  locked: boolean;
  analysis: ResumeAnalysis | AnalysisPreview;
}) {
  // O paywall está desativado na v1 (PAYWALL_ENABLED=false), então a API
  // devolve a análise completa. Quando o Stripe entrar, `locked` vira true
  // para análises não pagas e `fullAnalysis` será null (apenas preview).
  const fullAnalysis = "strengths" in analysis ? analysis : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Análise do seu currículo
        </h1>
        <p className="mt-2 text-neutral-500">
          Nota geral:{" "}
          <span className="font-semibold text-neutral-900">
            {analysis.overallScore}/100
          </span>
        </p>
      </header>

      {/* Notas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <ScoreCard label="Nota geral" score={analysis.overallScore} big />
        <ScoreCard label="Compatibilidade ATS" score={analysis.atsScore} />
        <ScoreCard label="Clareza" score={analysis.clarityScore} />
        <ScoreCard label="Impacto" score={analysis.impactScore} />
        <ScoreCard label="Mercado europeu" score={analysis.europeanMarketScore} />
      </div>

      {analysis.jobMatch ? <JobMatchSection jobMatch={analysis.jobMatch} /> : null}

      {/* Resumo */}
      <Section title="Resumo">
        <p className="text-neutral-700">{analysis.summary}</p>
      </Section>

      {/* Problemas encontrados */}
      <Section title="Problemas encontrados">
        {analysis.problems.length === 0 ? (
          <Empty>Nenhum problema significativo encontrado.</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {analysis.problems.map((p, i) => (
              <li key={i} className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-neutral-900">{p.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium uppercase ${severityStyles[p.severity]}`}
                  >
                    {p.severity === "high" ? "alto" : p.severity === "medium" ? "médio" : "baixo"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {locked ? (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-lg font-semibold text-neutral-900">
            Desbloqueie a análise completa
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Veja seus pontos fortes, recomendações de melhoria e as palavras-chave
            que estão faltando no seu currículo.
          </p>
          <button
            disabled
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white opacity-60"
            title="Disponível em breve"
          >
            Otimizar meu currículo — em breve
          </button>
        </div>
      ) : fullAnalysis ? (
        <FullSections analysis={fullAnalysis} />
      ) : null}
    </div>
  );
}

