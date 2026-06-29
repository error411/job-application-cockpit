export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accomplishment_tag_links: {
        Row: {
          accomplishment_id: string
          created_at: string
          id: string
          tag_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_id: string
          created_at?: string
          id?: string
          tag_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_id?: string
          created_at?: string
          id?: string
          tag_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accomplishment_tag_links_accomplishment_id_user_id_fkey"
            columns: ["accomplishment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "accomplishment_tag_links_tag_id_user_id_fkey"
            columns: ["tag_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishment_tags"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      accomplishment_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accomplishment_technologies: {
        Row: {
          accomplishment_id: string
          created_at: string
          id: string
          technology_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_id: string
          created_at?: string
          id?: string
          technology_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_id?: string
          created_at?: string
          id?: string
          technology_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accomplishment_technologies_accomplishment_id_user_id_fkey"
            columns: ["accomplishment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "accomplishment_technologies_technology_id_user_id_fkey"
            columns: ["technology_id", "user_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      accomplishments: {
        Row: {
          career_profile_id: string | null
          confidence_score: number | null
          created_at: string
          evidence_url: string | null
          id: string
          impact_summary: string | null
          is_featured: boolean
          metric_unit: string | null
          metric_value: string | null
          scope: string | null
          sort_order: number
          source_note: string | null
          statement: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_profile_id?: string | null
          confidence_score?: number | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          impact_summary?: string | null
          is_featured?: boolean
          metric_unit?: string | null
          metric_value?: string | null
          scope?: string | null
          sort_order?: number
          source_note?: string | null
          statement: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_profile_id?: string | null
          confidence_score?: number | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          impact_summary?: string | null
          is_featured?: boolean
          metric_unit?: string | null
          metric_value?: string | null
          scope?: string | null
          sort_order?: number
          source_note?: string | null
          statement?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accomplishments_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      application_assets: {
        Row: {
          cover_letter_markdown: string | null
          created_at: string
          follow_up_1_email_markdown: string | null
          follow_up_2_email_markdown: string | null
          id: string
          job_id: string
          recruiter_note: string | null
          resume_markdown: string | null
          status: string | null
        }
        Insert: {
          cover_letter_markdown?: string | null
          created_at?: string
          follow_up_1_email_markdown?: string | null
          follow_up_2_email_markdown?: string | null
          id?: string
          job_id: string
          recruiter_note?: string | null
          resume_markdown?: string | null
          status?: string | null
        }
        Update: {
          cover_letter_markdown?: string | null
          created_at?: string
          follow_up_1_email_markdown?: string | null
          follow_up_2_email_markdown?: string | null
          id?: string
          job_id?: string
          recruiter_note?: string | null
          resume_markdown?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      application_workflow_meta: {
        Row: {
          application_id: string
          created_at: string
          decision: string | null
          last_reviewed_at: string | null
          snoozed_until: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          decision?: string | null
          last_reviewed_at?: string | null
          snoozed_until?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          decision?: string | null
          last_reviewed_at?: string | null
          snoozed_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_workflow_meta_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          cover_letter_markdown: string | null
          cover_letter_text: string | null
          created_at: string
          disposition: string | null
          disposition_at: string | null
          disposition_notes: string | null
          follow_up_1_due: string | null
          follow_up_1_sent_at: string | null
          follow_up_2_due: string | null
          follow_up_2_sent_at: string | null
          id: string
          job_id: string
          notes: string | null
          resume_markdown: string | null
          resume_text: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_letter_markdown?: string | null
          cover_letter_text?: string | null
          created_at?: string
          disposition?: string | null
          disposition_at?: string | null
          disposition_notes?: string | null
          follow_up_1_due?: string | null
          follow_up_1_sent_at?: string | null
          follow_up_2_due?: string | null
          follow_up_2_sent_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          resume_markdown?: string | null
          resume_text?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_letter_markdown?: string | null
          cover_letter_text?: string | null
          created_at?: string
          disposition?: string | null
          disposition_at?: string | null
          disposition_notes?: string | null
          follow_up_1_due?: string | null
          follow_up_1_sent_at?: string | null
          follow_up_2_due?: string | null
          follow_up_2_sent_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          resume_markdown?: string | null
          resume_text?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          job_type: string
          last_error: string | null
          max_attempts: number
          payload: Json
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          job_type: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          job_type?: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          api_version: string | null
          created_at: string
          event_type: string
          id: string
          livemode: boolean
          payload: Json
          processed_at: string | null
          processing_error: string | null
          stripe_event_id: string
        }
        Insert: {
          api_version?: string | null
          created_at?: string
          event_type: string
          id?: string
          livemode?: boolean
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          stripe_event_id: string
        }
        Update: {
          api_version?: string | null
          created_at?: string
          event_type?: string
          id?: string
          livemode?: boolean
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          amount_cents: number | null
          billing_customer_id: string | null
          billing_interval: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          metadata: Json
          plan_key: string
          raw_stripe_json: Json
          status: string
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          billing_customer_id?: string | null
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json
          plan_key?: string
          raw_stripe_json?: Json
          status: string
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          billing_customer_id?: string | null
          billing_interval?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json
          plan_key?: string
          raw_stripe_json?: Json
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          created_at: string | null
          degree: string | null
          details: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          is_current: boolean | null
          location: string | null
          school: string
          sort_order: number | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree?: string | null
          details?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          school: string
          sort_order?: number | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree?: string | null
          details?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          school?: string
          sort_order?: number | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_experience: {
        Row: {
          bullets: string[] | null
          candidate_profile_id: string | null
          company: string
          created_at: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          sort_order: number | null
          start_date: string | null
          summary: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bullets?: string[] | null
          candidate_profile_id?: string | null
          company: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          sort_order?: number | null
          start_date?: string | null
          summary?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bullets?: string[] | null
          candidate_profile_id?: string | null
          company?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          sort_order?: number | null
          start_date?: string | null
          summary?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidate_profile: {
        Row: {
          created_at: string
          email: string | null
          experience_bullets: string[] | null
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          strengths: string[] | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          experience_bullets?: string[] | null
          full_name: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          strengths?: string[] | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          experience_bullets?: string[] | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          strengths?: string[] | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      career_profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          github_url: string | null
          headline: string | null
          id: string
          is_default: boolean
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          summary: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          github_url?: string | null
          headline?: string | null
          id?: string
          is_default?: boolean
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          github_url?: string | null
          headline?: string | null
          id?: string
          is_default?: boolean
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          career_profile_id: string | null
          created_at: string
          credential_id: string | null
          credential_url: string | null
          does_not_expire: boolean
          expires_at: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          career_profile_id?: string | null
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          does_not_expire?: boolean
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          career_profile_id?: string | null
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          does_not_expire?: boolean
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      education: {
        Row: {
          career_profile_id: string | null
          created_at: string
          degree: string | null
          description: string | null
          end_date: string | null
          field_of_study: string | null
          honors: string[]
          id: string
          institution: string
          is_current: boolean
          location: string | null
          sort_order: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_profile_id?: string | null
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          honors?: string[]
          id?: string
          institution: string
          is_current?: boolean
          location?: string | null
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_profile_id?: string | null
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          honors?: string[]
          id?: string
          institution?: string
          is_current?: boolean
          location?: string | null
          sort_order?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      employers: {
        Row: {
          career_profile_id: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          name: string
          normalized_name: string | null
          sort_order: number
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          career_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          normalized_name?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          career_profile_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          normalized_name?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      job_scores: {
        Row: {
          created_at: string
          id: string
          job_id: string
          matched_skills: string[] | null
          missing_skills: string[] | null
          reasons: Json | null
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          reasons?: Json | null
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          reasons?: Json | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          company: string
          created_at: string
          description_clean: string | null
          description_raw: string
          id: string
          location: string | null
          posted_at: string | null
          source: string | null
          status: string
          title: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          company: string
          created_at?: string
          description_clean?: string | null
          description_raw: string
          id?: string
          location?: string | null
          posted_at?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          company?: string
          created_at?: string
          description_clean?: string | null
          description_raw?: string
          id?: string
          location?: string | null
          posted_at?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          suspended_at: string | null
          timezone_offset_minutes: number | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          suspended_at?: string | null
          timezone_offset_minutes?: number | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          suspended_at?: string | null
          timezone_offset_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      project_accomplishments: {
        Row: {
          accomplishment_id: string
          created_at: string
          id: string
          project_id: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_id: string
          created_at?: string
          id?: string
          project_id: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_id?: string
          created_at?: string
          id?: string
          project_id?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_accomplishments_accomplishment_id_user_id_fkey"
            columns: ["accomplishment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_accomplishments_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      project_technologies: {
        Row: {
          created_at: string
          id: string
          project_id: string
          technology_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          technology_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          technology_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_technologies_technology_id_user_id_fkey"
            columns: ["technology_id", "user_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      projects: {
        Row: {
          career_profile_id: string | null
          created_at: string
          description: string | null
          employer_id: string | null
          end_date: string | null
          id: string
          is_featured: boolean
          name: string
          project_url: string | null
          repository_url: string | null
          role_id: string | null
          sort_order: number
          start_date: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_profile_id?: string | null
          created_at?: string
          description?: string | null
          employer_id?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean
          name: string
          project_url?: string | null
          repository_url?: string | null
          role_id?: string | null
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_profile_id?: string | null
          created_at?: string
          description?: string | null
          employer_id?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          project_url?: string | null
          repository_url?: string | null
          role_id?: string | null
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "projects_employer_id_user_id_fkey"
            columns: ["employer_id", "user_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "projects_role_id_user_id_fkey"
            columns: ["role_id", "user_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      resume_variants: {
        Row: {
          career_profile_id: string | null
          composition: Json
          created_at: string
          generated_at: string | null
          generated_html: string | null
          generated_markdown: string | null
          generated_text: string | null
          generation_model: string | null
          generation_prompt: Json | null
          id: string
          job_id: string | null
          name: string
          target_company: string | null
          target_description: string | null
          target_title: string | null
          updated_at: string
          user_id: string
          variant_type: string
        }
        Insert: {
          career_profile_id?: string | null
          composition?: Json
          created_at?: string
          generated_at?: string | null
          generated_html?: string | null
          generated_markdown?: string | null
          generated_text?: string | null
          generation_model?: string | null
          generation_prompt?: Json | null
          id?: string
          job_id?: string | null
          name: string
          target_company?: string | null
          target_description?: string | null
          target_title?: string | null
          updated_at?: string
          user_id: string
          variant_type?: string
        }
        Update: {
          career_profile_id?: string | null
          composition?: Json
          created_at?: string
          generated_at?: string | null
          generated_html?: string | null
          generated_markdown?: string | null
          generated_text?: string | null
          generation_model?: string | null
          generation_prompt?: Json | null
          id?: string
          job_id?: string | null
          name?: string
          target_company?: string | null
          target_description?: string | null
          target_title?: string | null
          updated_at?: string
          user_id?: string
          variant_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_variants_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "resume_variants_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      role_accomplishments: {
        Row: {
          accomplishment_id: string
          created_at: string
          id: string
          role_id: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_id: string
          created_at?: string
          id?: string
          role_id: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_id?: string
          created_at?: string
          id?: string
          role_id?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_accomplishments_accomplishment_id_user_id_fkey"
            columns: ["accomplishment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "role_accomplishments_role_id_user_id_fkey"
            columns: ["role_id", "user_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      role_technologies: {
        Row: {
          created_at: string
          id: string
          role_id: string
          technology_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          technology_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          technology_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_technologies_role_id_user_id_fkey"
            columns: ["role_id", "user_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "role_technologies_technology_id_user_id_fkey"
            columns: ["technology_id", "user_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      roles: {
        Row: {
          career_profile_id: string | null
          created_at: string
          employer_id: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          responsibilities: string[]
          sort_order: number
          start_date: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          career_profile_id?: string | null
          created_at?: string
          employer_id?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          responsibilities?: string[]
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          career_profile_id?: string | null
          created_at?: string
          employer_id?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          responsibilities?: string[]
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "roles_employer_id_user_id_fkey"
            columns: ["employer_id", "user_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      signup_ip_emails: {
        Row: {
          created_at: string
          email_normalized: string
          ip_hash: string
          reservation_token: string
        }
        Insert: {
          created_at?: string
          email_normalized: string
          ip_hash: string
          reservation_token?: string
        }
        Update: {
          created_at?: string
          email_normalized?: string
          ip_hash?: string
          reservation_token?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          career_profile_id: string | null
          category: string | null
          created_at: string
          id: string
          is_featured: boolean
          name: string
          proficiency: string | null
          sort_order: number
          summary: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          career_profile_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          name: string
          proficiency?: string | null
          sort_order?: number
          summary?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          career_profile_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          name?: string
          proficiency?: string | null
          sort_order?: number
          summary?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      star_stories: {
        Row: {
          accomplishment_id: string | null
          action: string
          career_profile_id: string | null
          created_at: string
          id: string
          interview_question_targets: string[]
          lesson_learned: string | null
          project_id: string | null
          result: string
          role_id: string | null
          situation: string
          tags: string[]
          task: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accomplishment_id?: string | null
          action: string
          career_profile_id?: string | null
          created_at?: string
          id?: string
          interview_question_targets?: string[]
          lesson_learned?: string | null
          project_id?: string | null
          result: string
          role_id?: string | null
          situation: string
          tags?: string[]
          task: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accomplishment_id?: string | null
          action?: string
          career_profile_id?: string | null
          created_at?: string
          id?: string
          interview_question_targets?: string[]
          lesson_learned?: string | null
          project_id?: string | null
          result?: string
          role_id?: string | null
          situation?: string
          tags?: string[]
          task?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "star_stories_accomplishment_id_user_id_fkey"
            columns: ["accomplishment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accomplishments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "star_stories_career_profile_id_user_id_fkey"
            columns: ["career_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "star_stories_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "star_stories_role_id_user_id_fkey"
            columns: ["role_id", "user_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      technologies: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      release_signup_slot: {
        Args: {
          p_email: string
          p_ip_hash: string
          p_reservation_token: string
        }
        Returns: undefined
      }
      reserve_signup_slot: {
        Args: { p_email: string; p_ip_hash: string; p_max_accounts: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
