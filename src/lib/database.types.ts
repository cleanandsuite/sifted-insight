// Database types for Sifted Insight
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          source_id: string | null;
          external_id: string | null;
          title: string;
          content: string | null;
          summary: string | null;
          original_url: string;
          image_url: string | null;
          author: string | null;
          published_at: string;
          status: 'pending' | 'processing' | 'published' | 'failed' | 'archived';
          original_read_time: number | null;
          sifted_read_time: number | null;
          tags: string[] | null;
          media_type: 'image' | 'video' | null;
          media_url: string | null;
          rank_score: number | null;
          engagement_score: number | null;
          is_featured: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id?: string | null;
          external_id?: string | null;
          title: string;
          content?: string | null;
          summary?: string | null;
          original_url: string;
          image_url?: string | null;
          author?: string | null;
          published_at: string;
          status?: 'pending' | 'processing' | 'published' | 'failed' | 'archived';
          original_read_time?: number | null;
          sifted_read_time?: number | null;
          tags?: string[] | null;
          media_type?: 'image' | 'video' | null;
          media_url?: string | null;
          rank_score?: number | null;
          engagement_score?: number | null;
          is_featured?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string | null;
          external_id?: string | null;
          title?: string;
          content?: string | null;
          summary?: string | null;
          original_url?: string;
          image_url?: string | null;
          author?: string | null;
          published_at?: string;
          status?: 'pending' | 'processing' | 'published' | 'failed' | 'archived';
          original_read_time?: number | null;
          sifted_read_time?: number | null;
          tags?: string[] | null;
          media_type?: 'image' | 'video' | null;
          media_url?: string | null;
          rank_score?: number | null;
          engagement_score?: number | null;
          is_featured?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          name: string;
          rss_url: string | null;
          website_url: string | null;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'critical';
          is_active: boolean;
          scrape_interval_minutes: number;
          last_scrape_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          rss_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          is_active?: boolean;
          scrape_interval_minutes?: number;
          last_scrape_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          rss_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          is_active?: boolean;
          scrape_interval_minutes?: number;
          last_scrape_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          article_id: string;
          key_points: string[] | null;
          analysis: string | null;
          takeaways: string[] | null;
          hook: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          key_points?: string[] | null;
          analysis?: string | null;
          takeaways?: string[] | null;
          hook?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          key_points?: string[] | null;
          analysis?: string | null;
          takeaways?: string[] | null;
          hook?: string | null;
          created_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          article_id: string;
          rank_score: number;
          recency_score: number | null;
          authority_score: number | null;
          engagement_score: number | null;
          quality_score: number | null;
          freshness_score: number | null;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          rank_score: number;
          recency_score?: number | null;
          authority_score?: number | null;
          engagement_score?: number | null;
          quality_score?: number | null;
          freshness_score?: number | null;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          rank_score?: number;
          recency_score?: number | null;
          authority_score?: number | null;
          engagement_score?: number | null;
          quality_score?: number | null;
          freshness_score?: number | null;
          calculated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      article_categories: {
        Row: {
          id: string;
          article_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          category_id?: string;
          created_at?: string;
        };
      };
      scrape_logs: {
        Row: {
          id: string;
          source_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          articles_found: number;
          articles_added: number;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          articles_found?: number;
          articles_added?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          articles_found?: number;
          articles_added?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      recalculate_all_rankings: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      recalculate_article_ranking: {
        Args: { article_uuid: string };
        Returns: undefined;
      };
      get_articles_by_time_range: {
        Args: { start_time: string; end_time: string };
        Returns: Array<{
          id: string;
          title: string;
          published_at: string;
          rank_score: number;
        }>;
      };
    };
  };
}

// Helper type exports
export type Article = Database['public']['Tables']['articles']['Row'];
export type Source = Database['public']['Tables']['sources']['Row'];
export type Summary = Database['public']['Tables']['summaries']['Row'];
export type Ranking = Database['public']['Tables']['rankings']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type ScrapeLog = Database['public']['Tables']['scrape_logs']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

// Combined article with relations
export interface ArticleWithRelations extends Article {
  sources: Source | null;
  summaries: Summary | null;
  rankings: Ranking | null;
}

// User preferences type (for useAuth)
export interface UserPreferences {
  id: string;
  theme?: 'light' | 'dark' | 'system';
  email_notifications?: boolean;
  categories?: string[];
  created_at?: string;
  updated_at?: string;
}
