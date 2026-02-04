import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/hooks/useArticles';
import { ReadTimeComparison } from './ReadTimeComparison';
import { BookmarkButton } from './BookmarkButton';
import { SourceBadge } from './SourceBadge';
import { timeAgo } from '@/lib/timeAgo';

interface ArticleCardProps {
  article: Article;
  index: number;
}

export const ArticleCard = ({ article, index }: ArticleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index + 0.3 }}
    >
      <Link to={`/article/${article.id}`} className="block">
        <article className="card-brutal h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden border-b border-border-strong">
            <img
              src={article.mediaUrl}
              alt={article.originalTitle}
              className="w-full h-full object-cover"
            />
            {/* Bookmark button overlay */}
            <div className="absolute top-2 right-2">
              <BookmarkButton articleId={article.id} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Source & Tags */}
            <div className="flex items-center justify-between mb-3">
              <SourceBadge source={article.sourcePublication} />
              <span className="tag">{article.tags[0] || article.topic || 'News'}</span>
            </div>
            
            {/* Title */}
            <h2 className="text-lg font-semibold leading-snug mb-2 tracking-tight line-clamp-2">
              {article.originalTitle}
            </h2>
            
            {/* Author */}
            <p className="terminal-text text-muted-foreground mb-2">
              By {article.originalAuthor}
            </p>
            
            {/* AI Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
              {article.aiSummary}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <ReadTimeComparison 
                original={article.originalReadTime} 
                sifted={article.siftedReadTime} 
              />
              <span className="terminal-text text-muted-foreground">
                {timeAgo(article.publishedAt)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};
