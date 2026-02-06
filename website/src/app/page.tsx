'use client';

import { useState, useEffect } from 'react';
import { supabase, Article } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import SourceFilter from '@/components/SourceFilter';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedSource, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Skip fetch during SSR (build time)
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables in Vercel project settings.');
      }
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setArticles(data || []);
      
      // Extract unique sources
      const uniqueSources = [...new Set(data?.map(article => article.source_name) || [])];
      setSources(uniqueSources.sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Filter by source
    if (selectedSource !== 'All') {
      filtered = filtered.filter(article => article.source_name === selectedSource);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          (article.summary?.toLowerCase().includes(query) ?? false) ||
          article.source_name.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NOOZ</h1>
          <p className="text-xl text-primary-100 mb-8">
            Your personalized news aggregator. Stay informed with the latest stories.
          </p>
          
          {/* Search Bar */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Source Filter */}
        <SourceFilter
          sources={sources}
          selectedSource={selectedSource}
          onSelectSource={setSelectedSource}
        />

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error: {error}</p>
            <button
              onClick={fetchArticles}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
              {selectedSource !== 'All' && ` from ${selectedSource}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>

            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No articles found</p>
                <p className="text-sm mt-2">
                  {searchQuery || selectedSource !== 'All'
                    ? 'Try adjusting your filters or search query'
                    : 'Check back later for new articles'}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
