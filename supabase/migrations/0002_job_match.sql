-- Compatibilidade verificável entre currículo e vaga.
alter table public.resume_analyses
  add column if not exists target_role text,
  add column if not exists job_match jsonb;

comment on column public.resume_analyses.job_match is
  'Percentual calculado no servidor, requisitos, evidências e breakdown por categoria';

