import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";
import { PAYWALL_ENABLED } from "@/lib/config";
import { buildPreview, mapAnalysisRow, type DbAnalysisRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const { id } = await params;

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  if (row.user_id !== user.id) {
    return NextResponse.json(
      { error: "Sem permissão para acessar esta análise." },
      { status: 403 },
    );
  }

  const analysis = mapAnalysisRow(row as unknown as DbAnalysisRow);
  const locked = PAYWALL_ENABLED && !row.is_paid;

  return NextResponse.json({
    locked,
    analysis: locked ? buildPreview(analysis) : analysis,
  });
}
