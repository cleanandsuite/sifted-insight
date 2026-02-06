import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if env vars are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Article type definition (matching Supabase schema with UUIDs)
export interface Article {
  id: string;
  title: string;
  original_url: string;
  summary: string | null;
  content_text: string | null;
  source_name: string;
  image_url: string | null;
  published_at: string;
  slug: string | null;
  created_at?: string;
}

// Database response type
export interface ArticlesResponse {
  data: Article[] | null;
  error: Error | null;
}
