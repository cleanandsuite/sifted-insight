import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const StatusBar = () => {
  // Fetch real article count
  const { data: articleCount } = useQuery({
    queryKey: ['article-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000, // Cache for 1 minute
  });
  
  // Fetch last scrape time
  const { data: lastScrape } = useQuery({
    queryKey: ['last-scrape'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('last_scrape_at')
        .not('last_scrape_at', 'is', null)
        .order('last_scrape_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data?.last_scrape_at) return 'Never';
      
      const scrapeDate = new Date(data.last_scrape_at);
      const now = new Date();
      const diffMs = now.getTime() - scrapeDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffHours / 24)} day${diffHours >= 48 ? 's' : ''} ago`;
    },
    staleTime: 60000,
  });
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-b border-border-strong bg-background"
    >
      <div className="container flex items-center justify-between py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="status-pulse" />
            <span className="terminal-text">System Status: Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="terminal-text text-muted-foreground">Last Scrape:</span>
            <span className="terminal-text">{lastScrape || '...'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="terminal-text text-muted-foreground">Articles Processed:</span>
          <span className="terminal-text font-medium">{articleCount?.toLocaleString() || '...'}</span>
        </div>
      </div>
    </motion.div>
  );
};
