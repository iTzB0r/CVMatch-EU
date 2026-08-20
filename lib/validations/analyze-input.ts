import { z } from "zod";
import { ANALYSIS } from "@/lib/config";

export const analyzeInputSchema = z.object({
  text: z.string().min(1).max(ANALYSIS.MAX_TEXT_CHARS),
  market: z.enum(["pt", "br"]).default("pt"),
  targetRole: z.string().trim().max(120).optional().nullable(),
  jobDescription: z.string().trim().max(15_000).optional().nullable(),
  originalName: z.string().max(255).optional().nullable(),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(ANALYSIS.MAX_FILE_BYTES)
    .optional()
    .nullable(),
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
