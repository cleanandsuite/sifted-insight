import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRelatedArticles } from '@/hooks/useRelatedArticles';
import { timeAgo } from '@/lib/timeAgo';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedArticlesProps {
  articleId: string;
  topic?: string;
}

export const RelatedArticles = ({ articleId, topic }: RelatedArticlesProps) => {
  const { related, loading } = useRelatedArticles(articleId, topic);

  if (loading) {
    return (
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong">
          <h3 className="terminal-text font-medium text-foreground">Related Stories</h3>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border-strong bg-card"
    >
      <div className="p-4 border-b border-border-strong">
        <h3 className="terminal-text font-medium text-foreground">Related Stories</h3>
      </div>
      <div className="divide-y divide-border">
        {related.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="block p-4 hover:bg-card-hover transition-colors"
          >
            <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
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
          </Link>
        ))}
      </div>
    </motion.div>
  );
};
