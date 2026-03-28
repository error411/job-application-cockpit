insert into public.automation_jobs (
  job_type,
  entity_type,
  entity_id,
  status,
  payload,
  scheduled_for
)
values (
  'schedule_followups',
  'job',
  '7e665783-a238-49f9-b506-1d68a39fb415',
  'pending',
  '{}'::jsonb,
  now()
);