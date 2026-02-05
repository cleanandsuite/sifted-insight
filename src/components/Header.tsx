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
          <div className="flex items-center">
            {/* NOOZ - dark on light / light on dark */}
            <span className="font-mono text-xl font-black tracking-tighter bg-foreground text-background px-2 py-0.5">
              NOOZ
            </span>
            {/* NEWS - inverse: light on dark / dark on light */}
            <span className="font-mono text-xl font-black tracking-tighter bg-background text-foreground px-2 py-0.5 border border-foreground -ml-px">
              .NEWS
            </span>
            {/* Pulsing indicator */}
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse ml-1" />
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
