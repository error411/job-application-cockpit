


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."set_automation_jobs_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_automation_jobs_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."application_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "resume_markdown" "text",
    "cover_letter_markdown" "text",
    "recruiter_note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "follow_up_1_email_markdown" "text",
    "follow_up_2_email_markdown" "text"
);


ALTER TABLE "public"."application_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'ready'::"text" NOT NULL,
    "notes" "text",
    "applied_at" timestamp with time zone,
    "follow_up_1_due" timestamp with time zone,
    "follow_up_2_due" timestamp with time zone,
    "resume_markdown" "text",
    "resume_text" "text",
    "cover_letter_markdown" "text",
    "cover_letter_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "follow_up_1_sent_at" timestamp with time zone,
    "follow_up_2_sent_at" timestamp with time zone,
    CONSTRAINT "applications_status_check" CHECK (("status" = ANY (ARRAY['ready'::"text", 'applied'::"text", 'follow_up_due'::"text", 'interviewing'::"text", 'rejected'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "last_error" "text",
    "scheduled_for" timestamp with time zone DEFAULT "now"() NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "automation_jobs_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['job'::"text", 'application'::"text"]))),
    CONSTRAINT "automation_jobs_job_type_check" CHECK (("job_type" = ANY (ARRAY['score_job'::"text", 'generate_assets'::"text", 'schedule_followups'::"text", 'generate_followup_assets'::"text"]))),
    CONSTRAINT "automation_jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."automation_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_experience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_profile_id" "uuid" NOT NULL,
    "company" "text" NOT NULL,
    "title" "text" NOT NULL,
    "bullets" "text"[] DEFAULT '{}'::"text"[],
    "technologies" "text"[] DEFAULT '{}'::"text"[],
    "summary" "text",
    "location" "text",
    "start_date" "date",
    "end_date" "date",
    "is_current" boolean,
    "sort_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."candidate_experience" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_profile" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "title" "text",
    "summary" "text",
    "strengths" "text"[] DEFAULT '{}'::"text"[],
    "experience_bullets" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."candidate_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "matched_skills" "text"[] DEFAULT '{}'::"text"[],
    "missing_skills" "text"[] DEFAULT '{}'::"text"[],
    "reasons" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."job_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description_raw" "text" NOT NULL,
    "description_clean" "text",
    "location" "text",
    "posted_at" timestamp with time zone,
    "source" "text",
    "status" "text" DEFAULT 'captured'::"text" NOT NULL,
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['captured'::"text", 'scored'::"text", 'assets_generated'::"text", 'ready_to_apply'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."application_assets"
    ADD CONSTRAINT "application_assets_job_id_key" UNIQUE ("job_id");



ALTER TABLE ONLY "public"."application_assets"
    ADD CONSTRAINT "application_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_jobs"
    ADD CONSTRAINT "automation_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_experience"
    ADD CONSTRAINT "candidate_experience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_profile"
    ADD CONSTRAINT "candidate_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_scores"
    ADD CONSTRAINT "job_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



CREATE INDEX "automation_jobs_entity_idx" ON "public"."automation_jobs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "automation_jobs_job_type_idx" ON "public"."automation_jobs" USING "btree" ("job_type");



CREATE UNIQUE INDEX "automation_jobs_pending_unique_idx" ON "public"."automation_jobs" USING "btree" ("job_type", "entity_type", "entity_id") WHERE ("status" = ANY (ARRAY['pending'::"text", 'processing'::"text"]));



CREATE INDEX "automation_jobs_status_scheduled_idx" ON "public"."automation_jobs" USING "btree" ("status", "scheduled_for");



CREATE OR REPLACE TRIGGER "automation_jobs_set_updated_at" BEFORE UPDATE ON "public"."automation_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_automation_jobs_updated_at"();



ALTER TABLE ONLY "public"."application_assets"
    ADD CONSTRAINT "application_assets_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."job_scores"
    ADD CONSTRAINT "job_scores_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."set_automation_jobs_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_automation_jobs_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_automation_jobs_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."application_assets" TO "anon";
GRANT ALL ON TABLE "public"."application_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."application_assets" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."automation_jobs" TO "anon";
GRANT ALL ON TABLE "public"."automation_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_experience" TO "anon";
GRANT ALL ON TABLE "public"."candidate_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_experience" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_profile" TO "anon";
GRANT ALL ON TABLE "public"."candidate_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_profile" TO "service_role";



GRANT ALL ON TABLE "public"."job_scores" TO "anon";
GRANT ALL ON TABLE "public"."job_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."job_scores" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































