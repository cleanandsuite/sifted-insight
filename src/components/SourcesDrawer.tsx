import { X, ExternalLink, List, BadgePercent } from 'lucide-react';
import { Source, formatRelativeTime, truncateText, getScoreColor, getTypeBadgeClass } from '@/data/sources';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  articleTitle?: string;
}

const SourcesDrawer = ({ isOpen, onClose, sources, articleTitle }: SourcesDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sources</h2>
              {articleTitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[280px]">
                  For: {truncateText(articleTitle, 50)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close sources"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <List className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No sources available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sources count */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sources.length} source{sources.length !== 1 ? 's' : ''} for this summary
              </p>

              {/* Sources list */}
              <div className="space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    {/* Source header */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* Logo */}
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {source.sourceLogoUrl ? (
                          <img
                            src={source.sourceLogoUrl}
                            alt={source.sourceName}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">
                            {source.sourceName.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Source name and type */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {source.sourceName}
                          </span>
                          {source.type && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeClass(source.type)}`}>
                              {source.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {source.score !== undefined && (
                            <span className="flex items-center gap-1">
                              <BadgePercent className="w-3 h-3" />
                              <span className={getScoreColor(source.score)}>
                                {source.score}% match
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Article title (linked) */}
                    <a
                      href={source.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 line-clamp-2"
                    >
                      {source.originalTitle}
                    </a>

                    {/* Short description */}
                    {source.shortDescription && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {source.shortDescription}
                      </p>
                    )}

                    {/* Meta and action */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{source.author}</span>
                        {source.publishedAt && (
                          <span className="ml-2 font-mono">
                            {formatRelativeTime(source.publishedAt)}
                          </span>
                        )}
                      </div>

                      <a
                        href={source.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Read
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click "Read" to view the original source article
          </p>
        </div>
      </div>
    </>
  );
};

export default SourcesDrawer;
