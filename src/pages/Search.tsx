// ============================================================================
// SEARCH PAGE
// Dedicated search results page with filters and pagination
// ============================================================================

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchResults } from '@/components/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { 
  SlidersHorizontal, 
  Calendar, 
  Tag,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// SEARCH PAGE COMPONENT
// ============================================================================

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const {
    query,
    results,
    totalCount,
    loading,
    page,
    pageSize,
    filters,
    search,
    loadMore,
    clearSearch,
    setFilters,
  } = useSearch();

  // Calculate pagination
  const hasMore = results.length < totalCount;
  const currentPage = Math.ceil(results.length / pageSize);

  // Handle sort change
  const handleSortChange = (sortBy: 'relevance' | 'date' | 'rank') => {
    setFilters({ sortBy });
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (sortBy !== 'relevance') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
  };

  // Handle date range change
  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range);
    const now = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    switch (range) {
      case 'today':
        dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'week':
        dateFrom = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case 'month':
        dateFrom = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        break;
      default:
        dateFrom = undefined;
        dateTo = undefined;
    }

    setFilters({ dateFrom, dateTo });
  };

  // Active filters count
  const activeFilterCount = [
    filters.sortBy && filters.sortBy !== 'relevance',
    dateRange !== 'all',
    filters.sourceId,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Articles</h1>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder="Search for articles, topics, or sources..."
              className="w-full px-5 py-4 text-lg bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-shadow"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors
                ${showFilters ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}
              `}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-background text-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-border" />

            {/* Date Range Quick Select */}
            <div className="inline-flex items-center rounded-lg border bg-card overflow-hidden">
              {(['all', 'today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`
                    px-3 py-1.5 text-sm transition-colors
                    ${dateRange === range 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'}
                  `}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'date' | 'rank')}
              className="px-3 py-1.5 rounded-lg border bg-card text-sm outline-none cursor-pointer"
            >
              <option value="relevance">Most Relevant</option>
              <option value="date">Most Recent</option>
              <option value="rank">Highest Ranked</option>
            </select>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setDateRange('all');
                  setFilters({ sortBy: 'relevance', sourceId: undefined, dateFrom: undefined, dateTo: undefined });
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-card">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value as typeof dateRange)}
                    className="w-full px-3 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Any time</option>
                    <option value="today">Last 24 hours</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={filters.sortBy || 'relevance'}
                    onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'date' | 'rank')}
                    className="w-full px-3 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date (newest first)</option>
                    <option value="date">Date (oldest first)</option>
                    <option value="rank">Rank Score</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Source (coming soon)
                  </label>
                  <select
                    disabled
                    className="w-full px-3 py-2 rounded-lg border bg-muted cursor-not-allowed"
                  >
                    <option value="">All sources</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          <SearchResults
            results={results}
            loading={loading}
            query={query}
            totalCount={totalCount}
            onLoadMore={loadMore}
            hasMore={hasMore}
            sortBy={filters.sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
