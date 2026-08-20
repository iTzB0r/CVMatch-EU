import { z } from "zod";

export const analyzeInputSchema = z.object({
  text: z.string().min(1).max(50_000),
  market: z.enum(["pt", "br"]).default("pt"),
  targetRole: z.string().trim().max(120).optional().nullable(),
  originalName: z.string().max(255).optional().nullable(),
  sizeBytes: z.number().int().positive().max(50_000_000).optional().nullable(),
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
