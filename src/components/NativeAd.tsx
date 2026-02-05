import { motion } from 'framer-motion';
import { AdUnit } from './AdUnit';

export const NativeAd = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-border-strong bg-secondary/50"
    >
      <div className="p-2 border-b border-border-strong">
        <span className="sponsored-label">Sponsored</span>
      </div>
      <AdUnit format="fluid" className="min-h-[100px]" />
    </motion.div>
  );
};
