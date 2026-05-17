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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conflict_resolutions: {
        Row: {
          choice: string
          conflict_id: string
          id: string
          invitee_id: string
          submitted_at: string
          trip_id: string
        }
        Insert: {
          choice: string
          conflict_id: string
          id?: string
          invitee_id: string
          submitted_at?: string
          trip_id: string
        }
        Update: {
          choice?: string
          conflict_id?: string
          id?: string
          invitee_id?: string
          submitted_at?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conflict_resolutions_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflict_resolutions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      invitees: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          joined_at: string | null
          token_hash: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          joined_at?: string | null
          token_hash: string
          trip_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          joined_at?: string | null
          token_hash?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitees_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboard_picks: {
        Row: {
          id: string
          invitee_id: string
          photo_ids: number[]
          submitted_at: string
          trip_id: string
        }
        Insert: {
          id?: string
          invitee_id: string
          photo_ids?: number[]
          submitted_at?: string
          trip_id: string
        }
        Update: {
          id?: string
          invitee_id?: string
          photo_ids?: number[]
          submitted_at?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_picks_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: true
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboard_picks_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          energy: number
          evening_schedule: string | null
          id: string
          invitee_id: string
          morning_schedule: string | null
          notes: string | null
          restrictions: string | null
          submitted_at: string
          trip_id: string
          vibes: string[]
        }
        Insert: {
          energy?: number
          evening_schedule?: string | null
          id?: string
          invitee_id: string
          morning_schedule?: string | null
          notes?: string | null
          restrictions?: string | null
          submitted_at?: string
          trip_id: string
          vibes?: string[]
        }
        Update: {
          energy?: number
          evening_schedule?: string | null
          id?: string
          invitee_id?: string
          morning_schedule?: string | null
          notes?: string | null
          restrictions?: string | null
          submitted_at?: string
          trip_id?: string
          vibes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "preferences_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: true
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferences_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: string
          created_at: string
          depart_date: string | null
          destination: string
          id: string
          itinerary: Json | null
          name: string
          organizer_email: string
          organizer_name: string
          return_date: string | null
          status: string
        }
        Insert: {
          budget: string
          created_at?: string
          depart_date?: string | null
          destination: string
          id?: string
          itinerary?: Json | null
          name: string
          organizer_email: string
          organizer_name: string
          return_date?: string | null
          status?: string
        }
        Update: {
          budget?: string
          created_at?: string
          depart_date?: string | null
          destination?: string
          id?: string
          itinerary?: Json | null
          name?: string
          organizer_email?: string
          organizer_name?: string
          return_date?: string | null
          status?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          approved: boolean
          id: string
          invitee_id: string
          trip_id: string
          voted_at: string
        }
        Insert: {
          approved: boolean
          id?: string
          invitee_id: string
          trip_id: string
          voted_at?: string
        }
        Update: {
          approved?: boolean
          id?: string
          invitee_id?: string
          trip_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: true
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
