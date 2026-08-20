import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  helpful: z.boolean(),
  comment: z.string().trim().max(1000).optional().nullable(),
});

async function getOwnedAnalysis(
  analysisId: string,
  userId: string,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("resume_analyses")
    .select("id")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .maybeSingle();

  return error || !data ? null : data;
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
  if (!(await getOwnedAnalysis(id, user.id))) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("analysis_feedback")
    .select("helpful, comment")
    .eq("analysis_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[feedback] read_failed", { code: error.code });
    return NextResponse.json(
      { error: "Não foi possível carregar seu feedback." },
      { status: 500 },
    );
  }

  return NextResponse.json({ feedback: data ?? null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const body = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Feedback inválido." }, { status: 400 });
  }

  const { id } = await params;
  if (!(await getOwnedAnalysis(id, user.id))) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const comment = body.data.comment || null;
  const { error } = await getSupabaseAdmin()
    .from("analysis_feedback")
    .upsert(
      {
        analysis_id: id,
        user_id: user.id,
        helpful: body.data.helpful,
        comment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "analysis_id" },
    );

  if (error) {
    console.error("[feedback] save_failed", { code: error.code });
    return NextResponse.json(
      { error: "Não foi possível salvar seu feedback." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    feedback: { helpful: body.data.helpful, comment },
  });
}

