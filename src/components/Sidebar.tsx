import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/data/mockArticles';

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
      {/* Suggested Reads */}
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong">
          <h3 className="terminal-text font-medium text-foreground">Suggested Reads</h3>
        </div>
        <div className="divide-y divide-border">
          {suggestedArticles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="block p-4 hover:bg-card-hover transition-colors"
            >
              <span className="terminal-text text-muted-foreground block mb-1">
                {article.sourcePublication}
              </span>
              <h4 className="text-sm font-medium leading-snug line-clamp-2">
                {article.originalTitle}
              </h4>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Sponsored Ad Slot */}
      <div className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong flex items-center justify-between">
          <span className="sponsored-label">Sponsored</span>
        </div>
        <div className="p-4">
          <div className="aspect-square bg-secondary flex items-center justify-center border border-border">
            <div className="text-center p-4">
              <span className="terminal-text text-muted-foreground block mb-2">Ad Space</span>
              <span className="text-xs text-muted-foreground">300×300</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Advertise with SIFT. Reach tech-savvy readers.
          </p>
        </div>
      </div>
      
      {/* Newsletter */}
      <div className="border border-border-strong bg-foreground text-background">
        <div className="p-4">
          <h3 className="font-mono text-sm font-medium mb-2">Get Sifted Daily</h3>
          <p className="text-xs opacity-70 mb-4">
            AI-curated news digest delivered to your inbox.
          </p>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm bg-transparent border border-background/30 placeholder:text-background/50 focus:outline-none focus:border-background mb-2"
          />
          <button className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
