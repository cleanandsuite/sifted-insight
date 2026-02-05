import { motion } from 'framer-motion';
import { Article } from '@/hooks/useArticles';
import { TrendingList } from './TrendingList';
import { CategoryNav } from './CategoryNav';
import { NewsletterSignup } from './NewsletterSignup';
import { AdUnit } from './AdUnit';

interface SidebarProps {
  suggestedArticles: Article[];
}

export const Sidebar = ({ suggestedArticles }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      {/* Trending Now */}
      <TrendingList />
      
      {/* Categories */}
      <CategoryNav variant="vertical" />
      
      {/* Sponsored Ad Slot */}
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong flex items-center justify-between">
          <span className="sponsored-label">Sponsored</span>
        </div>
        <div className="p-4">
          <AdUnit format="rectangle" className="min-h-[250px]" />
        </div>
      </div>
      
      {/* Newsletter */}
      <NewsletterSignup variant="sidebar" />
    </motion.aside>
  );
};
