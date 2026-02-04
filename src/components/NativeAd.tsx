import { motion } from 'framer-motion';

export const NativeAd = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-border-strong bg-secondary/50 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center">
            <span className="terminal-text text-muted-foreground">Logo</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="sponsored-label">Partner Content</span>
          </div>
          <h4 className="font-medium mb-1">
            Build AI-powered apps 10x faster
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Discover how leading teams are shipping products faster with modern development tools.
          </p>
          <span className="terminal-text text-primary cursor-pointer hover:underline">
            Learn More →
          </span>
        </div>
      </div>
    </motion.div>
  );
};
