import { NextRequest, NextResponse } from "next/server";
import { analyzeInputSchema } from "@/lib/validations/analyze-input";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/ai/analyze-resume";
import { isRateLimited } from "@/lib/rate-limit";
import { ANALYSIS, PAYWALL_ENABLED } from "@/lib/config";
import { buildPreview } from "@/lib/types";

// Análise de currículo pode levar 20–60s. Estende o limite no Vercel.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  if (
    isRateLimited(
      `analyze:${user.id}`,
      ANALYSIS.RATE_LIMIT.MAX_PER_USER_PER_HOUR,
      ANALYSIS.RATE_LIMIT.WINDOW_MS,
    )
  ) {
    return NextResponse.json(
      { error: "Você atingiu o limite de análises gratuitas. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  let body;
  try {
    body = analyzeInputSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Dados inválidos. Envie o texto extraído do currículo." },
      { status: 400 },
    );
  }

  const text = body.text.trim();
  if (text.length < ANALYSIS.MIN_TEXT_CHARS) {
    return NextResponse.json(
      {
        error:
          "O texto extraído do currículo parece curto demais para uma análise. Verifique se o PDF tem camada de texto (não é escaneado).",
      },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdmin();

  // 1. Registra o documento (só o texto extraído — binário não é armazenado).
  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      original_name: body.originalName ?? null,
      mime_type: "application/pdf",
      size_bytes: body.sizeBytes ?? null,
      extracted_text: text,
      status: "processing",
    })
    .select("id")
    .single();

  if (docError || !document) {
    console.error("[analyze] insert document:", docError);
    return NextResponse.json(
      { error: "Erro ao salvar o documento. Tente novamente." },
      { status: 500 },
    );
  }

  // 2. Análise com a IA (JSON estruturado e validado por zod).
  let analysis;
  try {
    analysis = await analyzeResume({ text, market: body.market });
  } catch (err) {
    console.error("[analyze] AI error:", err);
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);
    return NextResponse.json(
      { error: "A análise falhou. Tente novamente em instantes." },
      { status: 502 },
    );
  }

  // 3. Persiste a análise.
  const { data: analysisRow, error: insertError } = await supabase
    .from("resume_analyses")
    .insert({
      document_id: document.id,
      user_id: user.id,
      provider: "anthropic",
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      scores: {
        overall: analysis.overallScore,
        ats: analysis.atsScore,
        clarity: analysis.clarityScore,
        impact: analysis.impactScore,
        europeanMarket: analysis.europeanMarketScore,
      },
      summary: analysis.summary,
      strengths: analysis.strengths,
      problems: analysis.problems,
      recommendations: analysis.recommendations,
      keywords: analysis.keywords,
      underrated_experience: analysis.underratedExperience,
      formatting_issues: analysis.formattingIssues,
      is_paid: false,
    })
    .select("id")
    .single();

  if (insertError || !analysisRow) {
    console.error("[analyze] insert analysis:", insertError);
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);
    return NextResponse.json(
      { error: "Erro ao salvar a análise. Tente novamente." },
      { status: 500 },
    );
  }

  await supabase.from("documents").update({ status: "done" }).eq("id", document.id);

  const locked = PAYWALL_ENABLED;
  return NextResponse.json({
    analysisId: analysisRow.id,
    documentId: document.id,
    locked,
    analysis: locked ? buildPreview(analysis) : analysis,
  });
}
