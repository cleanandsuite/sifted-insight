import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/data/mockArticles';
import { ReadTimeComparison } from './ReadTimeComparison';

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
        <div className="relative w-full aspect-[21/9] border border-border-strong overflow-hidden">
          <img
            src={article.mediaUrl}
            alt={article.originalTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                <span className="tag-accent">{article.tags[0]}</span>
                <span className="font-mono text-xs text-white/70 uppercase">
                  {article.sourcePublication}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
                {article.originalTitle}
              </h1>
              
              {/* AI Summary */}
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 max-w-3xl">
                {article.aiSummary}
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-6">
                <ReadTimeComparison 
                  original={article.originalReadTime} 
                  sifted={article.siftedReadTime}
                  variant="hero"
                />
                <span className="font-mono text-xs text-white/60 uppercase">
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
