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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          student_answer: string | null
          writing_feedback: Json | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          student_answer?: string | null
          writing_feedback?: Json | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          student_answer?: string | null
          writing_feedback?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          finished_at: string | null
          id: string
          is_completed: boolean
          quiz_id: string
          score: number | null
          speaking_feedback: string | null
          started_at: string
          student_id: string
          student_name: string
          total_questions: number | null
          warnings: number
        }
        Insert: {
          finished_at?: string | null
          id?: string
          is_completed?: boolean
          quiz_id: string
          score?: number | null
          speaking_feedback?: string | null
          started_at?: string
          student_id: string
          student_name: string
          total_questions?: number | null
          warnings?: number
        }
        Update: {
          finished_at?: string | null
          id?: string
          is_completed?: boolean
          quiz_id?: string
          score?: number | null
          speaking_feedback?: string | null
          started_at?: string
          student_id?: string
          student_name?: string
          total_questions?: number | null
          warnings?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      pbl_activities: {
        Row: {
          created_at: string
          created_by: string | null
          grammar_topics: string
          id: string
          is_published: boolean
          knowledge_area: string
          mcer_level: string
          skills: string[]
          time_limit_minutes: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grammar_topics?: string
          id?: string
          is_published?: boolean
          knowledge_area?: string
          mcer_level?: string
          skills?: string[]
          time_limit_minutes?: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grammar_topics?: string
          id?: string
          is_published?: boolean
          knowledge_area?: string
          mcer_level?: string
          skills?: string[]
          time_limit_minutes?: number
          title?: string
        }
        Relationships: []
      }
      pbl_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role?: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pbl_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pbl_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pbl_sessions: {
        Row: {
          activity_id: string
          detailed_feedback: Json | null
          finished_at: string | null
          id: string
          is_completed: boolean
          score: number | null
          started_at: string
          student_id: string
          student_name: string
        }
        Insert: {
          activity_id: string
          detailed_feedback?: Json | null
          finished_at?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          started_at?: string
          student_id: string
          student_name: string
        }
        Update: {
          activity_id?: string
          detailed_feedback?: Json | null
          finished_at?: string | null
          id?: string
          is_completed?: boolean
          score?: number | null
          started_at?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pbl_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "pbl_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          audio_script: string | null
          correct_answer: string
          created_at: string
          id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question_text: string
          quiz_id: string
          sort_order: number
          type: string
        }
        Insert: {
          audio_script?: string | null
          correct_answer?: string
          created_at?: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_text: string
          quiz_id: string
          sort_order?: number
          type?: string
        }
        Update: {
          audio_script?: string | null
          correct_answer?: string
          created_at?: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_text?: string
          quiz_id?: string
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          audio_speed: number | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          mcer_level: string
          num_questions: number | null
          skills: string[]
          target_audience: string
          time_limit_minutes: number | null
          title: string
          topics: string
          writing_word_limit: number | null
        }
        Insert: {
          audio_speed?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          mcer_level?: string
          num_questions?: number | null
          skills?: string[]
          target_audience?: string
          time_limit_minutes?: number | null
          title: string
          topics?: string
          writing_word_limit?: number | null
        }
        Update: {
          audio_speed?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          mcer_level?: string
          num_questions?: number | null
          skills?: string[]
          target_audience?: string
          time_limit_minutes?: number | null
          title?: string
          topics?: string
          writing_word_limit?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
