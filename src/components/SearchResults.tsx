// ============================================================================
// SEARCH RESULTS COMPONENT
// Displays search results with highlighted matching terms
// ============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  ExternalLink, 
  Tag, 
  ChevronRight, 
  Filter,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import type { SearchResult } from '@/hooks/useSearch';

// ============================================================================
// TYPES
// ============================================================================

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  totalCount: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  sortBy?: 'relevance' | 'date' | 'rank';
  onSortChange?: (sort: 'relevance' | 'date' | 'rank') => void;
}

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
}

// ============================================================================
// HIGHLIGHT TEXT COMPONENT
// ============================================================================

const HighlightedText = ({ 
  text, 
  highlight 
}: { 
  text?: string; 
  highlight: string;
}) => {
  if (!text || !highlight.trim()) {
    return <span>{text}</span>;
  }

  // Split text by highlight terms, preserving case
  const terms = highlight.split(/\s+/).filter(t => t.length > 0);
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase());
        return isMatch ? (
          <mark 
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

// ============================================================================
// RELEVANCE BADGE COMPONENT
// ============================================================================

const RelevanceBadge = ({ score }: { score: number }) => {
  let color = 'bg-gray-100 text-gray-700';
  let label = 'Low';
  
  if (score >= 0.8) {
    color = 'bg-green-100 text-green-700';
    label = 'High';
  } else if (score >= 0.5) {
    color = 'bg-yellow-100 text-yellow-700';
    label = 'Medium';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <TrendingUp className="w-3 h-3" />
      {label} match
    </span>
  );
};

// ============================================================================
// SEARCH RESULT ITEM COMPONENT
// ============================================================================

const SearchResultItem = ({ result, query }: SearchResultItemProps) => {
  const publishedDate = new Date(result.published_at);
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card border rounded-xl p-5 hover:border-primary/50 transition-all duration-200"
    >
      {/* Relevance Score */}
      <div className="absolute top-4 right-4">
        <RelevanceBadge score={result.relevance_score} />
      </div>

      {/* Source and Date */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {result.source_name && (
          <>
            <span className="font-medium text-foreground">{result.source_name}</span>
            <span>•</span>
          </>
        )}
        <Calendar className="w-3 h-3" />
        <time dateTime={result.published_at}>
          {formatDistanceToNow(publishedDate, { addSuffix: true })}
        </time>
      </div>

      {/* Title */}
      <Link 
        to={`/article/${result.id}`}
        className="block group-hover:text-primary transition-colors"
      >
        <h3 className="text-xl font-semibold leading-snug mb-2">
          <HighlightedText text={result.title} highlight={query} />
        </h3>
      </Link>

      {/* Summary / Headline */}
      {result.ts_headline && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-3">
          <HighlightedText text={result.ts_headline} highlight={query} />
        </p>
      )}

      {/* Author and Tags */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {result.author && (
          <span className="text-xs text-muted-foreground">
            By <span className="font-medium">{result.author}</span>
          </span>
        )}
        
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
            {result.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{result.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read Time */}
        {result.rank_score && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Star className="w-3 h-3" />
            Rank: {result.rank_score.toFixed(1)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <Link
          to={`/article/${result.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Read full article
          <ChevronRight className="w-4 h-4" />
        </Link>
        
        <a
          href={result.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Original
        </a>
      </div>
    </motion.article>
  );
};

// ============================================================================
// SEARCH RESULTS COMPONENT
// ============================================================================

export const SearchResults = ({
  results,
  loading,
  query,
  totalCount,
  onLoadMore,
  hasMore,
  sortBy = 'relevance',
  onSortChange,
}: SearchResultsProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  if (!query && results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Start your search</h3>
        <p className="text-muted-foreground">
          Enter a search term to find articles
        </p>
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-muted-foreground">
          We couldn't find any articles matching "{query}"
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Try different keywords or check your spelling</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {loading ? 'Searching...' : `Search Results`}
          </h2>
          {!loading && (
            <p className="text-muted-foreground mt-1">
              Found {totalCount.toLocaleString()} {totalCount === 1 ? 'result' : 'results'} 
              {query && <> for "<span className="font-medium">{query}</span>"</>}
            </p>
          )}
        </div>

        {/* Sort Options */}
        {onSortChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'relevance' | 'date' | 'rank')}
              className="bg-background border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="relevance">Most Relevant</option>
              <option value="date">Most Recent</option>
              <option value="rank">Highest Ranked</option>
            </select>
          </div>
        )}
      </div>

      {/* Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilters(prev => prev.filter(f => f !== filter))}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
            >
              {filter}
              <span className="text-xs">×</span>
            </button>
          ))}
          <button
            onClick={() => setActiveFilters([])}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results List */}
      <div className="grid gap-4">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            query={query}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load more results
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && results.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end of results</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
