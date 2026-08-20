import { z } from "zod";

export const resumeOptimizationAiSchema = z.object({
  title: z.string(),
  optimizedResume: z.string(),
  changeLog: z.array(z.string()),
  gapsNotAdded: z.array(z.string()),
});

export const resumeOptimizationSchema = z.object({
  title: z.string().min(1).max(120),
  optimizedResume: z.string().min(100).max(20_000),
  changeLog: z.array(z.string().min(1).max(300)).max(12),
  gapsNotAdded: z.array(z.string().min(1).max(300)).max(12),
});

export type ResumeOptimization = z.infer<typeof resumeOptimizationSchema>;

