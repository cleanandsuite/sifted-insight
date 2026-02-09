 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
export type ContentCategory = 'tech' | 'finance' | 'politics' | 'climate' | 'video_games';

export interface CategoryRatio {
  category: ContentCategory;
  count: number;
  ratio: number;
  targetRatio: number;
  deviation: number;
  isUnderrepresented: boolean;
}

export interface ContentMixData {
  distribution: CategoryRatio[];
  totalArticles: number;
  techRatio: number;
  otherRatio: number;
  deviationAlert: boolean;
}

const TARGET_RATIOS: Record<ContentCategory, number> = {
  tech: 0.60,
  video_games: 0.08,
  finance: 0.16,
  politics: 0.08,
  climate: 0.08,
};
 
 export function useContentMix(days: number = 7) {
   return useQuery({
     queryKey: ['content-mix', days],
     queryFn: async (): Promise<ContentMixData> => {
       const startDate = new Date();
       startDate.setDate(startDate.getDate() - days);
       
       // Get articles with content_category from the last N days
       const { data: articles, error } = await supabase
         .from('articles')
         .select('content_category')
         .gte('created_at', startDate.toISOString())
         .eq('status', 'published');
       
       if (error) {
         console.error('Error fetching content mix:', error);
         throw error;
       }
       
        // Count by category
        const counts: Record<ContentCategory, number> = {
          tech: 0,
          video_games: 0,
          finance: 0,
          politics: 0,
          climate: 0,
        };
        
        for (const article of articles || []) {
          const cat = article.content_category as ContentCategory | null;
          if (cat && cat in counts) {
            counts[cat]++;
          }
        }
       
       const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
       let deviationAlert = false;
       
       const distribution: CategoryRatio[] = Object.entries(counts).map(([category, count]) => {
         const cat = category as ContentCategory;
         const ratio = total > 0 ? count / total : 0;
         const targetRatio = TARGET_RATIOS[cat];
         const deviation = targetRatio - ratio;
         
         if (Math.abs(deviation) > 0.05) {
           deviationAlert = true;
         }
         
         return {
           category: cat,
           count,
           ratio,
           targetRatio,
           deviation,
           isUnderrepresented: deviation > 0,
         };
       });
       
        // Sort: tech first, then by target ratio descending
        distribution.sort((a, b) => {
          if (a.category === 'tech') return -1;
          if (b.category === 'tech') return 1;
          if (a.category === 'video_games') return -1;
          if (b.category === 'video_games') return 1;
          return b.targetRatio - a.targetRatio;
        });
        
        const techRatio = counts.tech / Math.max(total, 1);
        const otherRatio = (counts.video_games + counts.finance + counts.politics + counts.climate) / Math.max(total, 1);
       
       return {
         distribution,
         totalArticles: total,
         techRatio,
         otherRatio,
         deviationAlert,
       };
     },
     refetchInterval: 60000, // Refresh every minute
   });
 }