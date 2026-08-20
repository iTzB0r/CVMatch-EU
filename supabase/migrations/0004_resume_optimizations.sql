-- Uma versão otimizada e reutilizável por análise de currículo.
create table public.resume_optimizations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.resume_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  provider text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resume_optimizations_user_id_idx
  on public.resume_optimizations (user_id);

alter table public.resume_optimizations enable row level security;

create policy "resume_optimizations_owner_all" on public.resume_optimizations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

