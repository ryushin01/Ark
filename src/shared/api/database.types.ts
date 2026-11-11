export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_login_attempts: {
        Row: {
          client_hash: string;
          created_at: string;
          id: number;
        };
        ComputedFields: never;
        Insert: {
          client_hash: string;
          created_at?: string;
          id?: never;
        };
        Update: {
          client_hash?: string;
          created_at?: string;
          id?: never;
        };
        Relationships: [];
      };
      exhibits: {
        Row: {
          created_at: string;
          date_label: string | null;
          figure_slug: string;
          holder: string | null;
          id: string;
          image: NonNullable<Json>;
          kind: string;
          note: string | null;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          date_label?: string | null;
          figure_slug: string;
          holder?: string | null;
          id: string;
          image: NonNullable<Json>;
          kind: string;
          note?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date_label?: string | null;
          figure_slug?: string;
          holder?: string | null;
          id?: string;
          image?: NonNullable<Json>;
          kind?: string;
          note?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exhibits_figure_slug_fkey";
            columns: ["figure_slug"];
            isOneToOne: false;
            referencedRelation: "figures";
            referencedColumns: ["slug"];
          },
        ];
      };
      figures: {
        Row: {
          description: string[];
          domains: string[];
          epithet: string;
          grade: string | null;
          kind: string;
          name: string;
          name_en: string;
          pantheon_slug: string;
          slug: string;
          sort_order: number;
          summary: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          description?: string[];
          domains?: string[];
          epithet: string;
          grade?: string | null;
          kind?: string;
          name: string;
          name_en: string;
          pantheon_slug: string;
          slug: string;
          sort_order?: number;
          summary: string;
          updated_at?: string;
        };
        Update: {
          description?: string[];
          domains?: string[];
          epithet?: string;
          grade?: string | null;
          kind?: string;
          name?: string;
          name_en?: string;
          pantheon_slug?: string;
          slug?: string;
          sort_order?: number;
          summary?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "figures_pantheon_slug_fkey";
            columns: ["pantheon_slug"];
            isOneToOne: false;
            referencedRelation: "pantheons";
            referencedColumns: ["slug"];
          },
        ];
      };
      genealogies: {
        Row: {
          pantheon_slug: string;
          roots: NonNullable<Json>;
          source: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          pantheon_slug: string;
          roots?: NonNullable<Json>;
          source: string;
          updated_at?: string;
        };
        Update: {
          pantheon_slug?: string;
          roots?: NonNullable<Json>;
          source?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "genealogies_pantheon_slug_fkey";
            columns: ["pantheon_slug"];
            isOneToOne: true;
            referencedRelation: "pantheons";
            referencedColumns: ["slug"];
          },
        ];
      };
      pantheons: {
        Row: {
          continent: string;
          cover_exhibit_id: string;
          description: string[];
          earliest_source: string;
          era_label: string;
          era_year: number;
          name: string;
          name_en: string;
          region: string;
          slug: string;
          summary: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          continent?: string;
          cover_exhibit_id: string;
          description?: string[];
          earliest_source: string;
          era_label: string;
          era_year: number;
          name: string;
          name_en: string;
          region: string;
          slug: string;
          summary: string;
          updated_at?: string;
        };
        Update: {
          continent?: string;
          cover_exhibit_id?: string;
          description?: string[];
          earliest_source?: string;
          era_label?: string;
          era_year?: number;
          name?: string;
          name_en?: string;
          region?: string;
          slug?: string;
          summary?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pantheons_cover_exhibit_fk";
            columns: ["cover_exhibit_id"];
            isOneToOne: false;
            referencedRelation: "exhibits";
            referencedColumns: ["id"];
          },
        ];
      };
      works: {
        Row: {
          created_at: string;
          creator: string | null;
          figure_slugs: string[];
          images: NonNullable<Json>;
          medium: string;
          slug: string;
          status: string;
          summary: string | null;
          title: string;
          title_original: string;
          updated_at: string;
          year: number | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          creator?: string | null;
          figure_slugs?: string[];
          images?: NonNullable<Json>;
          medium: string;
          slug: string;
          status?: string;
          summary?: string | null;
          title: string;
          title_original: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          created_at?: string;
          creator?: string | null;
          figure_slugs?: string[];
          images?: NonNullable<Json>;
          medium?: string;
          slug?: string;
          status?: string;
          summary?: string | null;
          title?: string;
          title_original?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
