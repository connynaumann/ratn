/**
 * Erzeugt aus dem Supabase-Projekt `system-map` (nfmyezhwwwreqjryxlho) am 07.09.2026.
 * Nicht von Hand ändern. Nach einer neuen Migration neu erzeugen und einchecken –
 * die Datei wird eingecheckt, damit der Build ohne Netzzugriff auskommt.
 */
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
      allowed_email: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      dependency: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          source_id: string
          source_type: Database["public"]["Enums"]["dependency_source"]
          target_goal_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string
          source_id: string
          source_type: Database["public"]["Enums"]["dependency_source"]
          target_goal_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          source_id?: string
          source_type?: Database["public"]["Enums"]["dependency_source"]
          target_goal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_target_goal_id_fkey"
            columns: ["target_goal_id"]
            isOneToOne: false
            referencedRelation: "goal"
            referencedColumns: ["id"]
          },
        ]
      }
      goal: {
        Row: {
          color: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          owner_id: string
          pos_x: number
          pos_y: number
          priority: Database["public"]["Enums"]["card_priority"] | null
          start_date: string
          status_override: Database["public"]["Enums"]["card_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          start_date?: string
          status_override?: Database["public"]["Enums"]["card_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          start_date?: string
          status_override?: Database["public"]["Enums"]["card_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      goal_vision: {
        Row: {
          created_at: string
          goal_id: string
          owner_id: string
          sort_index: number
          vision_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          owner_id?: string
          sort_index?: number
          vision_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          owner_id?: string
          sort_index?: number
          vision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_vision_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_vision_vision_id_fkey"
            columns: ["vision_id"]
            isOneToOne: false
            referencedRelation: "vision"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          goal_id: string
          id: string
          owner_id: string
          pos_x: number
          pos_y: number
          priority: Database["public"]["Enums"]["card_priority"] | null
          sort_index: number
          start_date: string
          status: Database["public"]["Enums"]["card_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_id: string
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          sort_index?: number
          start_date?: string
          status?: Database["public"]["Enums"]["card_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_id?: string
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          sort_index?: number
          start_date?: string
          status?: Database["public"]["Enums"]["card_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goal"
            referencedColumns: ["id"]
          },
        ]
      }
      metric: {
        Row: {
          created_at: string
          current_value: number | null
          done: boolean
          id: string
          initiative_id: string
          owner_id: string
          pos_x: number
          pos_y: number
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          done?: boolean
          id?: string
          initiative_id: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          done?: boolean
          id?: string
          initiative_id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiative"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          active_vision_id: string | null
          filter_goal_ids: string[]
          filter_status: Database["public"]["Enums"]["card_status"][]
          layout: Database["public"]["Enums"]["layout_mode"]
          owner_id: string
          theme: Database["public"]["Enums"]["theme_mode"]
          timeline_scale: Database["public"]["Enums"]["timeline_scale"]
          updated_at: string
          view: Database["public"]["Enums"]["view_mode"]
        }
        Insert: {
          active_vision_id?: string | null
          filter_goal_ids?: string[]
          filter_status?: Database["public"]["Enums"]["card_status"][]
          layout?: Database["public"]["Enums"]["layout_mode"]
          owner_id?: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          timeline_scale?: Database["public"]["Enums"]["timeline_scale"]
          updated_at?: string
          view?: Database["public"]["Enums"]["view_mode"]
        }
        Update: {
          active_vision_id?: string | null
          filter_goal_ids?: string[]
          filter_status?: Database["public"]["Enums"]["card_status"][]
          layout?: Database["public"]["Enums"]["layout_mode"]
          owner_id?: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          timeline_scale?: Database["public"]["Enums"]["timeline_scale"]
          updated_at?: string
          view?: Database["public"]["Enums"]["view_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "settings_active_vision_id_fkey"
            columns: ["active_vision_id"]
            isOneToOne: false
            referencedRelation: "vision"
            referencedColumns: ["id"]
          },
        ]
      }
      vision: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          owner_id: string
          pos_x: number
          pos_y: number
          priority: Database["public"]["Enums"]["card_priority"] | null
          start_date: string
          status_override: Database["public"]["Enums"]["card_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          start_date?: string
          status_override?: Database["public"]["Enums"]["card_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          owner_id?: string
          pos_x?: number
          pos_y?: number
          priority?: Database["public"]["Enums"]["card_priority"] | null
          start_date?: string
          status_override?: Database["public"]["Enums"]["card_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_priority: "hoch" | "mittel" | "niedrig"
      card_status: "in_planung" | "begonnen" | "abgeschlossen" | "blockiert"
      dependency_source: "goal" | "initiative"
      layout_mode: "flexible" | "sorted" | "net"
      theme_mode: "dark" | "light" | "system"
      timeline_scale: "week" | "month"
      view_mode: "map" | "linear"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_priority: ["hoch", "mittel", "niedrig"],
      card_status: ["in_planung", "begonnen", "abgeschlossen", "blockiert"],
      dependency_source: ["goal", "initiative"],
      layout_mode: ["flexible", "sorted", "net"],
      theme_mode: ["dark", "light", "system"],
      timeline_scale: ["week", "month"],
      view_mode: ["map", "linear"],
    },
  },
} as const
