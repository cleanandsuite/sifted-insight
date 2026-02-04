import { List } from 'lucide-react';

interface SourcesIconProps {
  onClick: () => void;
  sourceCount?: number;
  className?: string;
}

const SourcesIcon = ({ onClick, sourceCount, className = '' }: SourcesIconProps) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group ${className}`}
      aria-label="View sources"
    >
      <List className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors hidden sm:inline">
        Sources
      </span>
      {sourceCount !== undefined && sourceCount > 0 && (
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          {sourceCount}
        </span>
      )}
      <style>{`
        @media (max-width: 640px) {
          .sources-icon span {
            display: none;
          }
        }
      `}</style>
    </button>
  );
};

export default SourcesIcon;
