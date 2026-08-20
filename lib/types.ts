import type { ResumeAnalysis } from "@/lib/validations/resume-analysis";

// O que o usuário vê antes de pagar (quando o paywall estiver ativo).
export type AnalysisPreview = {
  overallScore: number;
  atsScore: number;
  clarityScore: number;
  impactScore: number;
  europeanMarketScore: number;
  summary: string;
  problems: ResumeAnalysis["problems"];
  jobMatch: ResumeAnalysis["jobMatch"];
};

export type AnalyzeResponse = {
  analysisId: string;
  documentId: string;
  locked: boolean;
  analysis: ResumeAnalysis | AnalysisPreview;
};

export type GetAnalysisResponse = {
  locked: boolean;
  analysis: ResumeAnalysis | AnalysisPreview;
};

// Formato da linha em resume_analyses (colunas jsonb).
export type DbAnalysisRow = {
  id: string;
  document_id: string;
  user_id: string;
  provider: string | null;
  model: string | null;
  scores: {
    overall: number;
    ats: number;
    clarity: number;
    impact: number;
    europeanMarket: number;
  };
  summary: string | null;
  strengths: string[];
  problems: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
  }[];
  recommendations: string[];
  keywords: { present: string[]; missing: string[] };
  underrated_experience: string[];
  formatting_issues: string[];
  target_role: string | null;
  job_match: ResumeAnalysis["jobMatch"] | null;
  is_paid: boolean;
  created_at: string;
};

export function mapAnalysisRow(row: DbAnalysisRow): ResumeAnalysis {
  return {
    overallScore: row.scores.overall,
    atsScore: row.scores.ats,
    clarityScore: row.scores.clarity,
    impactScore: row.scores.impact,
    europeanMarketScore: row.scores.europeanMarket,
    summary: row.summary ?? "",
    strengths: row.strengths ?? [],
    problems: row.problems ?? [],
    recommendations: row.recommendations ?? [],
    keywords: row.keywords ?? { present: [], missing: [] },
    underratedExperience: row.underrated_experience ?? [],
    formattingIssues: row.formatting_issues ?? [],
    jobMatch: row.job_match ?? null,
  };
}

export function buildPreview(a: ResumeAnalysis): AnalysisPreview {
  return {
    overallScore: a.overallScore,
    atsScore: a.atsScore,
    clarityScore: a.clarityScore,
    impactScore: a.impactScore,
    europeanMarketScore: a.europeanMarketScore,
    summary: a.summary,
    problems: a.problems.slice(0, 2),
    jobMatch: a.jobMatch,
  };
}

