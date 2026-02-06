'use client';

import { useState, useMemo } from 'react';
import { Article } from '@/types';
import ArticleCard from './ArticleCard';
import SearchFilter from './SearchFilter';

interface ArticleGridProps {
  articles: Article[];
  sources: string[];
}

export default function ArticleGrid({ articles, sources }: ArticleGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesSource = !selectedSource || article.source_name === selectedSource;
      return matchesSearch && matchesSource;
    });
  }, [articles, searchQuery, selectedSource]);

  return (
    <div>
      <SearchFilter
        sources={sources}
        searchQuery={searchQuery}
        selectedSource={selectedSource}
        onSearchChange={setSearchQuery}
        onSourceChange={setSelectedSource}
      />
      
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">
            Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
