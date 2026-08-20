-- Feedback curto para calibrar a utilidade e a assertividade das análises.
create table public.analysis_feedback (
  analysis_id uuid primary key references public.resume_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpful boolean not null,
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index analysis_feedback_user_id_idx
  on public.analysis_feedback (user_id);

alter table public.analysis_feedback enable row level security;

create policy "analysis_feedback_owner_all" on public.analysis_feedback
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

