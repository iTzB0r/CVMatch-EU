import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

// Cliente com a service role key — usado APENAS no servidor.
// As policies de RLS continuam valendo para a leitura/escrita como dono,
// mas aqui ignoramos RLS, então a autenticação é feita explicitamente
// via `getUserFromBearerToken` (nunca confiar no user_id vindo do cliente).
export function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase (admin) não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local",
    );
  }

  admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return admin;
}

export async function getUserFromBearerToken(
  authHeader: string | null,
) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length);
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !data.user) return null;
  return data.user;
}
