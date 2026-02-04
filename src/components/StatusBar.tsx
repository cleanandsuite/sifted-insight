import { motion } from 'framer-motion';

export const StatusBar = () => {
  const lastScrape = '2 mins ago';
  const articlesProcessed = 847;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-b border-border-strong bg-background"
    >
      <div className="container flex items-center justify-between py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="status-pulse" />
            <span className="terminal-text">System Status: Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="terminal-text text-muted-foreground">Last Scrape:</span>
            <span className="terminal-text">{lastScrape}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="terminal-text text-muted-foreground">Articles Processed:</span>
          <span className="terminal-text font-medium">{articlesProcessed.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};
