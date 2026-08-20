"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local",
    );
  }

  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cached;
}

export async function getSession() {
  const supabase = getBrowserSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Garante uma sessão ativa (anônima se necessário) e a retorna.
export async function ensureSession() {
  const supabase = getBrowserSupabase();
  const existing = await getSession();
  if (existing) return { supabase, session: existing };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(
      "Não foi possível iniciar uma sessão. Ative o 'Sign In Anônimo' nas configurações de Authentication do Supabase.",
    );
  }

  return { supabase, session: data.session };
}
