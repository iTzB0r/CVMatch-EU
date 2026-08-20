import { NextRequest, NextResponse } from "next/server";
import { analyzeInputSchema } from "@/lib/validations/analyze-input";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";
import {
  analyzeResume,
  classifyAnalysisError,
  getAnalysisModelId,
  type AnalysisFailureKind,
} from "@/lib/ai/analyze-resume";
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

  // Rate limit persistente: funciona mesmo com várias instâncias do servidor.
  const windowStart = new Date(
    Date.now() - ANALYSIS.RATE_LIMIT.WINDOW_MS,
  ).toISOString();
  const { count: recentAnalyses, error: countError } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("[analyze] rate_limit_check_failed");
    return NextResponse.json(
      { error: "Não foi possível iniciar a análise agora. Tente novamente." },
      { status: 503 },
    );
  }

  if ((recentAnalyses ?? 0) >= ANALYSIS.RATE_LIMIT.MAX_PER_USER_PER_HOUR) {
    return NextResponse.json(
      { error: "Você atingiu o limite de análises. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

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
    const failure = classifyAnalysisError(err);
    console.error("[analyze] ai_failed", { failure });
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);

    const response = analysisFailureResponse(failure);
    return NextResponse.json(
      { error: response.message },
      { status: response.status },
    );
  }

  // 3. Persiste a análise.
  const { data: analysisRow, error: insertError } = await supabase
    .from("resume_analyses")
    .insert({
      document_id: document.id,
      user_id: user.id,
      provider: "thonygg",
      model: getAnalysisModelId(),
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

function analysisFailureResponse(kind: AnalysisFailureKind) {
  switch (kind) {
    case "timeout":
      return {
        status: 504,
        message: "A análise demorou mais que o esperado. Tente novamente.",
      };
    case "rate_limit":
    case "unavailable":
      return {
        status: 503,
        message: "O serviço de análise está ocupado. Tente novamente em instantes.",
      };
    case "billing":
    case "configuration":
      return {
        status: 503,
        message: "O serviço de análise está temporariamente indisponível.",
      };
    default:
      return {
        status: 502,
        message: "A análise falhou. Tente novamente em instantes.",
      };
  }
}

