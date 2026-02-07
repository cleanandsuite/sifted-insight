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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          article_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_session_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_session_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_interactions: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          interaction_type: string
          user_session_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          interaction_type: string
          user_session_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_interactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          category_confidence: number | null
          content_category:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at: string | null
          engagement_score: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          media_type: string | null
          media_url: string | null
          original_read_time: number | null
          original_url: string
          published_at: string | null
          rank_score: number | null
          sifted_read_time: number | null
          slug: string
          source_id: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          summary: string | null
          tags: string[] | null
          title: string
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category_confidence?: number | null
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          media_type?: string | null
          media_url?: string | null
          original_read_time?: number | null
          original_url: string
          published_at?: string | null
          rank_score?: number | null
          sifted_read_time?: number | null
          slug: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          summary?: string | null
          tags?: string[] | null
          title: string
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category_confidence?: number | null
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          media_type?: string | null
          media_url?: string | null
          original_read_time?: number | null
          original_url?: string
          published_at?: string | null
          rank_score?: number | null
          sifted_read_time?: number | null
          slug?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ratio_config: {
        Row: {
          category: Database["public"]["Enums"]["content_category"]
          created_at: string | null
          id: string
          is_active: boolean | null
          sub_categories: Json | null
          target_ratio: number
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sub_categories?: Json | null
          target_ratio: number
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          sub_categories?: Json | null
          target_ratio?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          article_reads: number | null
          avg_read_time_seconds: number | null
          created_at: string | null
          date: string
          id: string
          page_views: number | null
          top_articles: Json | null
          top_topics: Json | null
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          article_reads?: number | null
          avg_read_time_seconds?: number | null
          created_at?: string | null
          date: string
          id?: string
          page_views?: number | null
          top_articles?: Json | null
          top_topics?: Json | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          article_reads?: number | null
          avg_read_time_seconds?: number | null
          created_at?: string | null
          date?: string
          id?: string
          page_views?: number | null
          top_articles?: Json | null
          top_topics?: Json | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          article_id: string | null
          authority_score: number | null
          computed_at: string | null
          content_score: number | null
          created_at: string | null
          engagement_score: number | null
          id: string
          rank_position: number | null
          rank_score: number
          ranking_factors: Json | null
          recency_score: number | null
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          authority_score?: number | null
          computed_at?: string | null
          content_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          rank_position?: number | null
          rank_score?: number
          ranking_factors?: Json | null
          recency_score?: number | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          authority_score?: number | null
          computed_at?: string | null
          content_score?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          rank_position?: number | null
          rank_score?: number
          ranking_factors?: Json | null
          recency_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_statistics: {
        Row: {
          articles_count: number | null
          category: Database["public"]["Enums"]["content_category"]
          created_at: string | null
          id: string
          ratio_achieved: number | null
          scrape_date: string
        }
        Insert: {
          articles_count?: number | null
          category: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          id?: string
          ratio_achieved?: number | null
          scrape_date: string
        }
        Update: {
          articles_count?: number | null
          category?: Database["public"]["Enums"]["content_category"]
          created_at?: string | null
          id?: string
          ratio_achieved?: number | null
          scrape_date?: string
        }
        Relationships: []
      }
      source_authority: {
        Row: {
          authority_score: number | null
          created_at: string | null
          id: string
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          authority_score?: number | null
          created_at?: string | null
          id?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          authority_score?: number | null
          created_at?: string | null
          id?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_authority_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: true
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          content_category:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_scrape_at: string | null
          name: string
          priority: Database["public"]["Enums"]["source_priority"] | null
          rss_url: string | null
          scrape_interval_minutes: number | null
          sub_category: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_scrape_at?: string | null
          name: string
          priority?: Database["public"]["Enums"]["source_priority"] | null
          rss_url?: string | null
          scrape_interval_minutes?: number | null
          sub_category?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          content_category?:
            | Database["public"]["Enums"]["content_category"]
            | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_scrape_at?: string | null
          name?: string
          priority?: Database["public"]["Enums"]["source_priority"] | null
          rss_url?: string | null
          scrape_interval_minutes?: number | null
          sub_category?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      summaries: {
        Row: {
          analysis: string | null
          article_id: string | null
          confidence_score: number | null
          created_at: string | null
          executive_summary: string | null
          id: string
          key_points: Json | null
          model_used: string | null
          takeaways: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis?: string | null
          article_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          executive_summary?: string | null
          id?: string
          key_points?: Json | null
          model_used?: string | null
          takeaways?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis?: string | null
          article_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          executive_summary?: string | null
          id?: string
          key_points?: Json | null
          model_used?: string | null
          takeaways?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      calculate_category_alignment_score: {
        Args: { article_id: string }
        Returns: number
      }
      calculate_sift_score_v4: {
        Args: { article_uuid: string }
        Returns: number
      }
      calculate_topic_relevance_score: {
        Args: { article_id: string }
        Returns: number
      }
      get_clustered_feed: {
        Args: { limit_count?: number }
        Returns: {
          author: string
          id: string
          image_url: string
          media_url: string
          original_read_time: number
          original_url: string
          published_at: string
          rank_score: number
          sifted_read_time: number
          source_id: string
          tags: string[]
          title: string
          topic: string
        }[]
      }
      get_ranked_feed_v4: {
        Args: {
          category_filter?: Database["public"]["Enums"]["content_category"]
          limit_count?: number
        }
        Returns: {
          author: string
          content_category: Database["public"]["Enums"]["content_category"]
          id: string
          image_url: string
          media_url: string
          original_read_time: number
          original_url: string
          published_at: string
          sift_score: number
          sifted_read_time: number
          source_id: string
          tags: string[]
          title: string
          topic: string
        }[]
      }
      get_related_articles: {
        Args: { article_id: string; limit_count?: number }
        Returns: {
          author: string
          id: string
          media_url: string
          original_url: string
          published_at: string
          rank_score: number
          source_id: string
          tags: string[]
          title: string
          topic: string
        }[]
      }
      get_trending_articles: {
        Args: { limit_count?: number }
        Returns: {
          author: string
          id: string
          original_url: string
          published_at: string
          rank_score: number
          source_id: string
          tags: string[]
          title: string
          topic: string
        }[]
      }
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["admin_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      track_article_interaction: {
        Args: {
          p_article_id: string
          p_interaction_type: string
          p_session_id?: string
        }
        Returns: undefined
      }
      upsert_article: {
        Args: {
          p_author?: string
          p_image_url?: string
          p_media_url?: string
          p_original_url: string
          p_slug: string
          p_source_id?: string
          p_tags?: string[]
          p_title: string
          p_topic?: string
        }
        Returns: string
      }
    }
    Enums: {
      admin_permission:
        | "manage_sources"
        | "manage_articles"
        | "trigger_scrape"
        | "view_analytics"
        | "manage_users"
      app_role: "admin" | "editor" | "viewer"
      article_status:
        | "pending"
        | "processing"
        | "published"
        | "failed"
        | "archived"
      content_category:
        | "tech"
        | "finance"
        | "politics"
        | "climate"
        | "video_games"
      source_priority: "low" | "medium" | "high" | "critical"
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
      admin_permission: [
        "manage_sources",
        "manage_articles",
        "trigger_scrape",
        "view_analytics",
        "manage_users",
      ],
      app_role: ["admin", "editor", "viewer"],
      article_status: [
        "pending",
        "processing",
        "published",
        "failed",
        "archived",
      ],
      content_category: [
        "tech",
        "finance",
        "politics",
        "climate",
        "video_games",
      ],
      source_priority: ["low", "medium", "high", "critical"],
    },
  },
} as const
