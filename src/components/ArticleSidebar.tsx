import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/hooks/useArticles';
import { RelatedArticles } from './RelatedArticles';
import { NewsletterSignup } from './NewsletterSignup';

interface ArticleSidebarProps {
  article: Article;
}

export const ArticleSidebar = ({ article }: ArticleSidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      {/* Related Articles */}
      <RelatedArticles articleId={article.id} topic={article.topic} />
      
      {/* Newsletter */}
      <NewsletterSignup variant="inline" />
      
      {/* Sponsored Ad Slot */}
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong flex items-center justify-between">
          <span className="sponsored-label">Sponsored</span>
        </div>
        <div className="p-4">
          <div className="aspect-[4/3] bg-secondary flex items-center justify-center border border-border">
            <div className="text-center p-4">
              <span className="terminal-text text-muted-foreground block mb-2">Ad Space</span>
              <span className="text-xs text-muted-foreground">300×250</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Advertise with SIFT. Reach tech-savvy readers.
          </p>
        </div>
      </div>
    </motion.aside>
  );
};
