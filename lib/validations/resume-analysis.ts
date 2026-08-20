import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high"]);

export const resumeAnalysisSchema = z.object({
  // notas 0–100
  overallScore: z.number().int().min(0).max(100),
  atsScore: z.number().int().min(0).max(100),
  clarityScore: z.number().int().min(0).max(100),
  impactScore: z.number().int().min(0).max(100),
  europeanMarketScore: z.number().int().min(0).max(100),

  // diagnóstico em 1–2 frases
  summary: z.string().min(1).max(400),

  strengths: z.array(z.string()).max(10),
  problems: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      severity: severitySchema,
    }),
  ).max(10),
  recommendations: z.array(z.string()).max(10),

  keywords: z.object({
    present: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  underratedExperience: z.array(z.string()).max(5),
  formattingIssues: z.array(z.string()).max(5),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
