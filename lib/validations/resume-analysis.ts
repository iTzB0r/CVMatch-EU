import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high"]);

export const requirementCategorySchema = z.enum([
  "technical",
  "experience",
  "mandatory",
  "seniority",
  "language_location",
  "education",
]);

export const jobRequirementSchema = z.object({
  requirement: z.string().min(1).max(200),
  category: requirementCategorySchema,
  importance: z.enum(["required", "preferred"]),
  status: z.enum(["matched", "partial", "missing"]),
  evidence: z.string().min(1).max(300).nullable(),
  recommendation: z.string().min(1).max(300).nullable(),
});

export const jobMatchAssessmentSchema = z.object({
  targetRole: z.string().max(120).nullable(),
  requirements: z.array(jobRequirementSchema).min(1).max(30),
});

export const jobMatchResultSchema = jobMatchAssessmentSchema.extend({
  score: z.number().int().min(0).max(100),
  breakdown: z.array(
    z.object({
      category: requirementCategorySchema,
      weight: z.number().int().min(0).max(100),
      score: z.number().int().min(0).max(100),
      requirements: z.number().int().positive(),
    }),
  ),
});

const resumeAnalysisFields = {
  overallScore: z.number().int().min(0).max(100),
  atsScore: z.number().int().min(0).max(100),
  clarityScore: z.number().int().min(0).max(100),
  impactScore: z.number().int().min(0).max(100),
  europeanMarketScore: z.number().int().min(0).max(100),
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
};

export const resumeAnalysisAiSchema = z.object({
  ...resumeAnalysisFields,
  jobMatch: jobMatchAssessmentSchema.nullable(),
});

export const resumeAnalysisSchema = z.object({
  ...resumeAnalysisFields,
  jobMatch: jobMatchResultSchema.nullable(),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
export type JobMatchAssessment = z.infer<typeof jobMatchAssessmentSchema>;
export type JobMatchResult = z.infer<typeof jobMatchResultSchema>;
export type RequirementCategory = z.infer<typeof requirementCategorySchema>;

