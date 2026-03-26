-- supabase/migrations/20260326_add_followup_tracking.sql

alter table applications
  add column if not exists follow_up_1_sent_at timestamptz null,
  add column if not exists follow_up_2_sent_at timestamptz null;

alter table application_assets
  add column if not exists follow_up_1_email_markdown text null,
  add column if not exists follow_up_2_email_markdown text null;