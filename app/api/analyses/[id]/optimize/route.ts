import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";
import {
  classifyAnalysisError,
  getSafeAnalysisErrorDetails,
  type AnalysisFailureKind,
} from "@/lib/ai/analyze-resume";
import { getAnalysisModelId, optimizeResume } from "@/lib/ai/optimize-resume";
import { jobMatchResultSchema } from "@/lib/validations/resume-analysis";
import { resumeOptimizationSchema } from "@/lib/validations/resume-optimization";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type AnalysisContext = {
  id: string;
  user_id: string;
  document_id: string;
  target_role: string | null;
  job_match: unknown;
};

async function getOwnedContext(analysisId: string, userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("resume_analyses")
    .select("id, user_id, document_id, target_role, job_match")
    .eq("id", analysisId)
    .maybeSingle();

  if (error || !data || data.user_id !== userId) return null;
  return data as AnalysisContext;
}

async function getStoredOptimization(analysisId: string, userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("resume_optimizations")
    .select("content")
    .eq("analysis_id", analysisId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const parsed = resumeOptimizationSchema.safeParse(data.content);
  return parsed.success ? parsed.data : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const { id } = await params;
  if (!(await getOwnedContext(id, user.id))) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    optimization: await getStoredOptimization(id, user.id),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const { id } = await params;
  const context = await getOwnedContext(id, user.id);
  if (!context) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const existing = await getStoredOptimization(id, user.id);
  if (existing) {
    return NextResponse.json({ optimization: existing, reused: true });
  }

  const jobMatch = jobMatchResultSchema.safeParse(context.job_match);
  if (!jobMatch.success) {
    return NextResponse.json(
      { error: "Analise o currículo com uma vaga antes de otimizá-lo." },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("extracted_text")
    .eq("id", context.document_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (documentError || !document?.extracted_text) {
    return NextResponse.json(
      { error: "O texto original do currículo não foi encontrado." },
      { status: 404 },
    );
  }

  let optimization;
  try {
    optimization = await optimizeResume({
      text: document.extracted_text,
      targetRole: context.target_role,
      jobMatch: jobMatch.data,
    });
  } catch (error) {
    const failure = classifyAnalysisError(error);
    console.error("[optimize] ai_failed", {
      failure,
      ...getSafeAnalysisErrorDetails(error),
    });
    const response = optimizationFailureResponse(failure);
    return NextResponse.json(
      { error: response.message },
      {
        status: response.status,
        headers: failure === "rate_limit" ? { "Retry-After": "10" } : undefined,
      },
    );
  }

  const { error: insertError } = await supabase.from("resume_optimizations").insert({
    analysis_id: id,
    user_id: user.id,
    content: optimization,
    provider: "thonygg",
    model: getAnalysisModelId(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const concurrent = await getStoredOptimization(id, user.id);
      if (concurrent) {
        return NextResponse.json({ optimization: concurrent, reused: true });
      }
    }

    console.error("[optimize] save_failed", { code: insertError.code });
    return NextResponse.json(
      { error: "A versão otimizada foi criada, mas não pôde ser salva." },
      { status: 500 },
    );
  }

  return NextResponse.json({ optimization, reused: false });
}

function optimizationFailureResponse(kind: AnalysisFailureKind) {
  switch (kind) {
    case "timeout":
      return {
        status: 504,
        message: "A otimização demorou mais que o esperado. Tente novamente.",
      };
    case "rate_limit":
    case "unavailable":
      return {
        status: 503,
        message: "O serviço de otimização está ocupado. Aguarde alguns segundos e tente novamente.",
      };
    case "billing":
    case "configuration":
      return {
        status: 503,
        message: "O serviço de otimização está temporariamente indisponível.",
      };
    case "invalid_output":
      return {
        status: 502,
        message: "A IA devolveu uma versão incompleta. Tente novamente.",
      };
    default:
      return {
        status: 502,
        message: "A otimização não pôde ser concluída agora. Tente novamente.",
      };
  }
}
