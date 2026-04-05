export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      activity_threads: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_silent: boolean
          last_entry_at: string | null
          linked_task_id: string | null
          linked_vendor_id: string | null
          owner_id: string
          sentiment: string
          status: string
          title: string
          updated_at: string
          urgency_level: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_silent?: boolean
          last_entry_at?: string | null
          linked_task_id?: string | null
          linked_vendor_id?: string | null
          owner_id: string
          sentiment?: string
          status?: string
          title: string
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_silent?: boolean
          last_entry_at?: string | null
          linked_task_id?: string | null
          linked_vendor_id?: string | null
          owner_id?: string
          sentiment?: string
          status?: string
          title?: string
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_threads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_threads_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_threads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          organisation_id: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          organisation_id: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          organisation_id?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          current_phase: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organisation_id: string
          start_date: string | null
          status: string
          type: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organisation_id: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organisation_id?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan_tier: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan_tier?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan_tier?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          accreditation_tier: string | null
          availability_notes: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_external: boolean
          organisation_id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accreditation_tier?: string | null
          availability_notes?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_external?: boolean
          organisation_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accreditation_tier?: string | null
          availability_notes?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_external?: boolean
          organisation_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          created_at: string
          end_date: string | null
          event_id: string
          id: string
          name: string
          order_index: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          event_id: string
          id?: string
          name: string
          order_index?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          event_id?: string
          id?: string
          name?: string
          order_index?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          department: string | null
          end_time: string
          event_id: string
          id: string
          person_id: string
          role_note: string | null
          shift_date: string
          start_time: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          end_time: string
          event_id: string
          id?: string
          person_id: string
          role_note?: string | null
          shift_date: string
          start_time: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          end_time?: string
          event_id?: string
          id?: string
          person_id?: string
          role_note?: string | null
          shift_date?: string
          start_time?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      standup_entries: {
        Row: {
          blocked_text: string | null
          created_at: string
          entry_date: string
          event_id: string
          id: string
          person_id: string
          today_text: string | null
          yesterday_text: string | null
        }
        Insert: {
          blocked_text?: string | null
          created_at?: string
          entry_date?: string
          event_id: string
          id?: string
          person_id: string
          today_text?: string | null
          yesterday_text?: string | null
        }
        Update: {
          blocked_text?: string | null
          created_at?: string
          entry_date?: string
          event_id?: string
          id?: string
          person_id?: string
          today_text?: string | null
          yesterday_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standup_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standup_entries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          depends_on: string | null
          description: string | null
          due_date: string | null
          event_id: string
          id: string
          is_critical_path: boolean
          owner_id: string | null
          phase_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          event_id: string
          id?: string
          is_critical_path?: boolean
          owner_id?: string | null
          phase_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string
          id?: string
          is_critical_path?: boolean
          owner_id?: string | null
          phase_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_depends_on_fkey"
            columns: ["depends_on"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_entries: {
        Row: {
          ai_escalate: boolean | null
          ai_processed: boolean
          ai_risk_keywords: string[] | null
          ai_sentiment: string | null
          ai_suggested_action: string | null
          ai_urgency: string | null
          author_id: string | null
          content: string
          created_at: string
          id: string
          thread_id: string
        }
        Insert: {
          ai_escalate?: boolean | null
          ai_processed?: boolean
          ai_risk_keywords?: string[] | null
          ai_sentiment?: string | null
          ai_suggested_action?: string | null
          ai_urgency?: string | null
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          thread_id: string
        }
        Update: {
          ai_escalate?: boolean | null
          ai_processed?: boolean
          ai_risk_keywords?: string[] | null
          ai_sentiment?: string | null
          ai_suggested_action?: string | null
          ai_urgency?: string | null
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_entries_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "activity_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          organisation_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organisation_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organisation_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shift_clashes: {
        Args: {
          p_end_time: string
          p_exclude_id?: string
          p_person_id: string
          p_shift_date: string
          p_start_time: string
        }
        Returns: {
          end_time: string
          event_id: string
          id: string
          role_note: string
          shift_date: string
          start_time: string
        }[]
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


// ============================================================
// Convenience row types
// ============================================================
type PublicTables = Database["public"]["Tables"]

export type Organisation   = PublicTables["organisations"]["Row"]
export type User           = PublicTables["users"]["Row"]
export type Event          = PublicTables["events"]["Row"]
export type Phase          = PublicTables["phases"]["Row"]
export type Person         = PublicTables["people"]["Row"]
export type Task           = PublicTables["tasks"]["Row"]
export type Shift          = PublicTables["shifts"]["Row"]
export type ActivityThread = PublicTables["activity_threads"]["Row"]
export type ThreadEntry    = PublicTables["thread_entries"]["Row"]
export type StandupEntry   = PublicTables["standup_entries"]["Row"]
export type Document       = PublicTables["documents"]["Row"]
