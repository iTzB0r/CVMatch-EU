-- CVMatch EU — migracao inicial (v1)
-- Entidades principais: documents + resume_analyses.
-- Outputs da IA ficam em jsonb (sem normalizar arrays internos).

-- Currículos enviados pelo usuário (somente o texto extraído)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- ok p/ anonimo
  original_name text,
  mime_type text,
  size_bytes integer,
  extracted_text text,
  status text not null default 'processing'
    check (status in ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete (GDPR)
);

-- Análises geradas pela IA
create table public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text,
  model text,
  scores jsonb not null, -- overall/ats/clarity/impact/european
  summary text,
  strengths jsonb not null default '[]',
  problems jsonb not null default '[]',
  recommendations jsonb not null default '[]',
  keywords jsonb not null default '{}',
  underrated_experience jsonb not null default '[]',
  formatting_issues jsonb not null default '[]',
  is_paid boolean not null default false,
  created_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);
create index resume_analyses_document_id_idx on public.resume_analyses (document_id);
create index resume_analyses_user_id_idx on public.resume_analyses (user_id);

-- RLS: apenas o dono acessa os próprios dados (usuários anônimos também têm auth.uid())
alter table public.documents enable row level security;
alter table public.resume_analyses enable row level security;

create policy "documents_owner_all" on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "resume_analyses_owner_all" on public.resume_analyses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
