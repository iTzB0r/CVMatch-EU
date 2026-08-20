import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getUserFromBearerToken,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnalysisListRow = {
  id: string;
  document_id: string;
  target_role: string | null;
  job_match: { score?: number } | null;
  scores: { overall?: number } | null;
  created_at: string;
};

type DocumentListRow = {
  id: string;
  original_name: string | null;
};

export async function GET(request: NextRequest) {
  const user = await getUserFromBearerToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: analyses, error: analysesError } = await supabase
    .from("resume_analyses")
    .select("id, document_id, target_role, job_match, scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (analysesError) {
    console.error("[analyses] list_failed");
    return NextResponse.json(
      { error: "Não foi possível carregar suas análises." },
      { status: 500 },
    );
  }

  const rows = (analyses ?? []) as unknown as AnalysisListRow[];
  if (rows.length === 0) {
    return NextResponse.json({ analyses: [] });
  }

  const documentIds = [...new Set(rows.map((row) => row.document_id))];
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, original_name")
    .eq("user_id", user.id)
    .in("id", documentIds)
    .is("deleted_at", null);

  if (documentsError) {
    console.error("[analyses] documents_list_failed");
    return NextResponse.json(
      { error: "Não foi possível carregar suas análises." },
      { status: 500 },
    );
  }

  const names = new Map(
    ((documents ?? []) as DocumentListRow[]).map((document) => [
      document.id,
      document.original_name,
    ]),
  );

  return NextResponse.json({
    analyses: rows
      .filter((row) => names.has(row.document_id))
      .map((row) => ({
        id: row.id,
        originalName: names.get(row.document_id) ?? "Currículo sem nome",
        targetRole: row.target_role,
        score: row.job_match?.score ?? row.scores?.overall ?? 0,
        hasJobMatch: typeof row.job_match?.score === "number",
        createdAt: row.created_at,
      })),
  });
}

