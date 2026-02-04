import { X, ExternalLink, List, BadgePercent } from 'lucide-react';
import { Source, formatRelativeTime, truncateText, getScoreColor, getTypeBadgeClass } from '@/data/sources';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  articleTitle?: string;
}

const SourcesModal = ({ isOpen, onClose, sources, articleTitle }: SourcesModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Full screen modal */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="min-h-full flex flex-col">
          {/* Header - sticky */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sources</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close sources"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {articleTitle && (
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources for:</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {truncateText(articleTitle, 100)}
                </p>
              </div>
            )}

            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <List className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No sources available</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sources.length} source{sources.length !== 1 ? 's' : ''} for this summary
                </p>

                <div className="space-y-4">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      {/* Source header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {source.sourceLogoUrl ? (
                            <img
                              src={source.sourceLogoUrl}
                              alt={source.sourceName}
                              className="w-7 h-7 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-500">
                              {source.sourceName.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Source info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {source.sourceName}
                            </span>
                            {source.type && (
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTypeBadgeClass(source.type)}`}>
                                {source.type}
                              </span>
                            )}
                            {source.score !== undefined && (
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getScoreColor(source.score)}`}>
                                <BadgePercent className="w-3 h-3" />
                                {source.score}% match
                              </span>
                            )}
                          </div>

                          {/* Author and date */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-medium">{source.author}</span>
                            {source.publishedAt && (
                              <span className="ml-2 font-mono">
                                {formatRelativeTime(source.publishedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Article title */}
                      <a
                        href={source.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-base font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
                      >
                        {source.originalTitle}
                      </a>

                      {/* Short description */}
                      {source.shortDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {source.shortDescription}
                        </p>
                      )}

                      {/* Read button */}
                      <a
                        href={source.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Read full article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Tap outside or press ESC to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SourcesModal;
