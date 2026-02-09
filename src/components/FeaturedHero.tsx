import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/hooks/useArticles';
import { ReadTimeComparison } from './ReadTimeComparison';
import { BookmarkButton } from './BookmarkButton';
 import { ArticleImage } from './ArticleImage';
import { timeAgo } from '@/lib/timeAgo';

interface FeaturedHeroProps {
  article: Article;
}

export const FeaturedHero = ({ article }: FeaturedHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] border border-border-strong overflow-hidden">
           <ArticleImage
            src={article.mediaUrl}
            alt={article.originalTitle}
             source={article.sourcePublication}
             category={article.tags[0] || article.topic}
             variant="hero"
             articleId={article.id}
             className="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Bookmark button */}
          <div className="absolute top-4 right-4 z-10">
            <BookmarkButton articleId={article.id} />
          </div>
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                <span className="tag-accent">{article.tags[0] || article.topic || 'News'}</span>
                <span className="font-mono text-[10px] sm:text-xs text-white/70 uppercase truncate max-w-[100px] sm:max-w-none">
                  {article.sourcePublication}
                </span>
                <span className="text-white/50 hidden sm:inline">•</span>
                <span className="font-mono text-[10px] sm:text-xs text-white/70">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
                {article.originalTitle}
              </h1>
              
              {/* AI Summary */}
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 max-w-3xl line-clamp-2">
                {article.aiSummary}
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <ReadTimeComparison 
                  original={article.originalReadTime} 
                  sifted={article.siftedReadTime}
                  variant="hero"
                />
                <span className="font-mono text-[10px] sm:text-xs text-white/60 uppercase truncate max-w-[150px] sm:max-w-none">
                  By {article.originalAuthor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
