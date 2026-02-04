import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarkButtonProps {
  articleId: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export const BookmarkButton = ({ articleId, variant = 'icon', className = '' }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(articleId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(articleId);
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
          saved 
            ? 'border-primary bg-primary text-primary-foreground' 
            : 'border-border-strong hover:bg-card-hover'
        } ${className}`}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <BookmarkCheck className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="unsaved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Bookmark className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-sm font-medium">
          {saved ? 'Saved' : 'Save'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 border border-border-strong hover:bg-card-hover transition-colors ${className}`}
      aria-label={saved ? 'Remove bookmark' : 'Add bookmark'}
    >
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <BookmarkCheck className="w-4 h-4 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="unsaved"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Bookmark className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
