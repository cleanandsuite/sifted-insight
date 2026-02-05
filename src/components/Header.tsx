import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

export const Header = () => {
  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="w-full border-b border-border-strong bg-background sticky top-0 z-50"
    >
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center font-mono text-xl font-black tracking-tight">
            <span className="text-foreground">NOOZ</span>
            <span className="text-primary mx-0.5">•</span>
            <span className="text-muted-foreground">NEWS</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="terminal-text hover:text-foreground transition-colors">
            Feed
          </Link>
          <Link to="/?category=trending" className="terminal-text hover:text-foreground transition-colors flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </Link>
          <span className="terminal-text hover:text-foreground transition-colors cursor-pointer">
            Sources
          </span>
        </nav>
        
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button className="tag-accent cursor-pointer hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>
      </div>
    </motion.header>
  );
};
