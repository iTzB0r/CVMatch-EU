"use client";

import type { ReactNode } from "react";
import type { AnalysisPreview } from "@/lib/types";
import type { ResumeAnalysis } from "@/lib/validations/resume-analysis";

type Band = "green" | "amber" | "red";
type JobMatch = NonNullable<ResumeAnalysis["jobMatch"]>;

const categoryLabels = {
  technical: "Competências técnicas",
  experience: "Experiência relevante",
  mandatory: "Requisitos obrigatórios",
  seniority: "Senioridade",
  language_location: "Idioma e localização",
  education: "Formação e certificações",
} as const;

const severityStyles = {
  low: "border-slate-200 bg-slate-50 text-slate-600",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

const matchStatus = {
  matched: {
    label: "Atendido",
    style: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  partial: {
    label: "Parcial",
    style: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  missing: {
    label: "Ausente",
    style: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
} as const;

function bandOf(score: number): Band {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

const bandStyles: Record<
  Band,
  { label: string; text: string; bar: string; ring: string }
> = {
  green: {
    label: "Excelente base",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
    ring: "#10b981",
  },
  amber: {
    label: "Bom potencial",
    text: "text-amber-700",
    bar: "bg-amber-500",
    ring: "#f59e0b",
  },
  red: {
    label: "Precisa de ajustes",
    text: "text-rose-700",
    bar: "bg-rose-500",
    ring: "#f43f5e",
  },
};

function ScoreRing({ score, label }: { score: number; label: string }) {
  const tone = bandStyles[bandOf(score)];

  return (
    <div
      className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full p-[10px] shadow-[0_20px_50px_-26px_rgba(15,40,71,0.65)]"
      style={{
        background: `conic-gradient(${tone.ring} ${score * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
      }}
      role="img"
      aria-label={`${label}: ${score}%`}
    >
      <div className="grid h-full w-full place-items-center rounded-full border border-white/15 bg-[#0F2847] text-center">
        <div>
          <p className="text-5xl font-black tracking-[-0.06em] text-white">
            {score}
            <span className="ml-0.5 text-xl font-bold text-emerald-300">%</span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, score }: { label: string; score: number }) {
  const tone = bandStyles[bandOf(score)];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-28 text-sm font-semibold leading-5 text-slate-600">
          {label}
        </p>
        <p className={`text-2xl font-black tracking-tight ${tone.text}`}>
          {score}
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] font-medium text-slate-400">{tone.label}</p>
    </article>
  );
}

function Panel({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`${eyebrow ? "mt-2" : ""} text-xl font-bold tracking-tight text-[#0F2847]`}>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-slate-400">{children}</p>;
}

function JobMatchHero({ jobMatch }: { jobMatch: JobMatch }) {
  const totals = jobMatch.requirements.reduce(
    (result, item) => ({
      ...result,
      [item.status]: result[item.status] + 1,
    }),
    { matched: 0, partial: 0, missing: 0 },
  );
  const tone = bandStyles[bandOf(jobMatch.score)];

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#0F2847] px-6 py-8 text-white shadow-[0_28px_70px_-38px_rgba(15,40,71,0.9)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
        <div className="flex justify-center lg:justify-start">
          <ScoreRing score={jobMatch.score} label="Match Score" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
              Compatibilidade com a vaga
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              {tone.label}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {jobMatch.targetRole ?? "Vaga analisada"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Sua porcentagem combina evidências do currículo, peso dos requisitos
            obrigatórios e aderência por categoria. Nenhuma competência ausente é
            considerada como atendida.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
            {[
              { value: totals.matched, label: "atendidos", color: "text-emerald-300" },
              { value: totals.partial, label: "parciais", color: "text-amber-300" },
              { value: totals.missing, label: "ausentes", color: "text-rose-300" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-4">
                <strong className={`block text-2xl font-black ${item.color}`}>{item.value}</strong>
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MatchBreakdown({ jobMatch }: { jobMatch: JobMatch }) {
  return (
    <Panel eyebrow="Como a nota foi formada" title="Match por categoria">
      <div className="space-y-5">
        {jobMatch.breakdown.map((item) => {
          const tone = bandStyles[bandOf(item.score)];
          return (
            <div key={item.category}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {categoryLabels[item.category]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Peso {item.weight}% · {item.requirements} requisito(s)
                  </p>
                </div>
                <strong className={`text-lg ${tone.text}`}>{item.score}%</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${item.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function PriorityActions({ jobMatch }: { jobMatch: JobMatch }) {
  const priorities = [...jobMatch.requirements]
    .filter((item) => item.status !== "matched")
    .sort((a, b) => {
      const rank = { missing: 0, partial: 1, matched: 2 };
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      const importanceRank = { required: 0, preferred: 1 };
      return importanceRank[a.importance] - importanceRank[b.importance];
    })
    .slice(0, 4);

  return (
    <Panel eyebrow="Seu plano de ação" title="Prioridades para aumentar o match" className="lg:col-span-2">
      {priorities.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          Todos os requisitos identificados foram atendidos. Agora concentre-se em
          tornar as evidências mais visíveis e mensuráveis.
        </div>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2">
          {priorities.map((item, index) => (
            <li key={`${item.requirement}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0F2847] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold leading-5 text-slate-900">{item.requirement}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${matchStatus[item.status].style}`}>
                      {matchStatus[item.status].label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {item.recommendation ?? "Deixe essa evidência explícita e fácil de localizar no currículo."}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function RequirementsList({ jobMatch }: { jobMatch: JobMatch }) {
  return (
    <Panel eyebrow="Auditoria de evidências" title="Todos os requisitos da vaga">
      <div className="space-y-3">
        {jobMatch.requirements.map((item, index) => (
          <article key={`${item.requirement}-${index}`} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${matchStatus[item.status].dot}`} />
                <div>
                  <p className="font-semibold leading-5 text-slate-900">{item.requirement}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {categoryLabels[item.category]} · {item.importance === "required" ? "Obrigatório" : "Desejável"}
                  </p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${matchStatus[item.status].style}`}>
                {matchStatus[item.status].label}
              </span>
            </div>
            {item.evidence ? (
              <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-2.5 text-sm leading-5 text-emerald-900">
                <span className="font-semibold">Evidência encontrada:</span> {item.evidence}
              </div>
            ) : null}
            {item.recommendation ? (
              <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm leading-5 text-slate-600">
                <span className="font-semibold text-slate-700">Próxima ação:</span> {item.recommendation}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Panel>
  );
}

function FullSections({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="O que já funciona" title="Pontos fortes">
          {analysis.strengths.length === 0 ? (
            <Empty>Nenhum ponto forte identificado.</Empty>
          ) : (
            <ul className="space-y-3">
              {analysis.strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
                      <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel eyebrow="Melhorias recomendadas" title="Próximos ajustes">
          {analysis.recommendations.length === 0 ? (
            <Empty>Nenhuma recomendação no momento.</Empty>
          ) : (
            <ol className="space-y-3">
              {analysis.recommendations.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-[#0F2847]">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel eyebrow="Leitura ATS" title="Palavras-chave">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700">Presentes no currículo</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.keywords.present.length === 0 ? (
                <Empty>Nenhuma palavra-chave identificada.</Empty>
              ) : (
                analysis.keywords.present.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    {keyword}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-slate-700">Oportunidades de inclusão</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.keywords.missing.length === 0 ? (
                <Empty>Nenhuma palavra-chave importante ausente.</Empty>
              ) : (
                analysis.keywords.missing.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                    {keyword}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Experiências pouco valorizadas">
          {analysis.underratedExperience.length === 0 ? (
            <Empty>Nenhuma experiência subutilizada identificada.</Empty>
          ) : (
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {analysis.underratedExperience.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Possíveis erros de formatação">
          {analysis.formattingIssues.length === 0 ? (
            <Empty>Nenhum problema de formatação identificado.</Empty>
          ) : (
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {analysis.formattingIssues.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
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
  const fullAnalysis = "strengths" in analysis ? analysis : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            Análise concluída
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#0F2847] sm:text-4xl">
            Seu diagnóstico profissional
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Veja onde seu currículo já convence e quais ajustes têm maior impacto na candidatura.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
          <span className="text-xs font-semibold text-slate-400">Nota geral</span>
          <strong className="text-2xl font-black text-[#0F2847]">{analysis.overallScore}</strong>
          <span className="text-sm font-semibold text-slate-400">/100</span>
        </div>
      </header>

      {analysis.jobMatch ? (
        <JobMatchHero jobMatch={analysis.jobMatch} />
      ) : (
        <section className="rounded-[2rem] bg-[#0F2847] p-8 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Diagnóstico geral</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <strong className="text-6xl font-black tracking-[-0.06em]">{analysis.overallScore}</strong>
            <span className="pb-2 text-xl font-semibold text-slate-300">/100</span>
          </div>
          <p className="mt-3 max-w-2xl text-slate-300">Adicione uma vaga na próxima análise para receber também o Match Score detalhado.</p>
        </section>
      )}

      <section aria-labelledby="score-details" className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="score-details" className="text-sm font-bold text-[#0F2847]">Saúde do currículo</h2>
          <p className="text-xs text-slate-400">Notas de 0 a 100</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard label="Nota geral" score={analysis.overallScore} />
          <MetricCard label="Compatibilidade ATS" score={analysis.atsScore} />
          <MetricCard label="Clareza" score={analysis.clarityScore} />
          <MetricCard label="Impacto" score={analysis.impactScore} />
          <MetricCard label="Mercado europeu" score={analysis.europeanMarketScore} />
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel eyebrow="Leitura executiva" title="Resumo da análise" className={analysis.jobMatch ? "lg:col-span-1" : "lg:col-span-3"}>
          <p className="text-sm leading-6 text-slate-600">{analysis.summary}</p>
        </Panel>
        {analysis.jobMatch ? <PriorityActions jobMatch={analysis.jobMatch} /> : null}
      </div>

      {analysis.jobMatch ? (
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <MatchBreakdown jobMatch={analysis.jobMatch} />
          <RequirementsList jobMatch={analysis.jobMatch} />
        </div>
      ) : null}

      <div className="mt-5">
        <Panel eyebrow="Pontos de atenção" title="Problemas encontrados">
          {analysis.problems.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Nenhum problema significativo encontrado.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {analysis.problems.map((problem, index) => (
                <article key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-5 text-slate-900">{problem.title}</h3>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${severityStyles[problem.severity]}`}>
                      {problem.severity === "high" ? "Alto" : problem.severity === "medium" ? "Médio" : "Baixo"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{problem.description}</p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {locked ? (
        <section className="mt-5 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Análise completa</p>
          <h2 className="mt-2 text-2xl font-bold text-[#0F2847]">Descubra como melhorar cada ponto</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Veja pontos fortes, recomendações e palavras-chave importantes para o mercado europeu.
          </p>
          <button disabled className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white opacity-60" title="Disponível em breve">
            Otimizar meu currículo — em breve
          </button>
        </section>
      ) : fullAnalysis ? (
        <div className="mt-5 space-y-5">
          <FullSections analysis={fullAnalysis} />
        </div>
      ) : null}
    </div>
  );
}

