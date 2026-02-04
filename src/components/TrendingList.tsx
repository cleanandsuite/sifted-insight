import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { timeAgo } from '@/lib/timeAgo';
import { Skeleton } from '@/components/ui/skeleton';

export const TrendingList = () => {
  const { trending, loading } = useTrending();

  if (loading) {
    return (
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="terminal-text font-medium text-foreground">Trending Now</h3>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex gap-3">
              <Skeleton className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border-strong bg-card"
    >
      <div className="p-4 border-b border-border-strong flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="terminal-text font-medium text-foreground">Trending Now</h3>
      </div>
      <div className="divide-y divide-border">
        {trending.map((article, index) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="block p-4 hover:bg-card-hover transition-colors"
          >
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground font-mono text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-1">
                  {article.originalTitle}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="terminal-text text-muted-foreground">
                    {article.sourcePublication}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="terminal-text text-muted-foreground">
                    {timeAgo(article.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};
