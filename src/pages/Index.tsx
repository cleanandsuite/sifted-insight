import { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';
import { Header } from '@/components/Header';
import { FeaturedHero } from '@/components/FeaturedHero';
import { ArticleCard } from '@/components/ArticleCard';
import { Sidebar } from '@/components/Sidebar';
import { SkeletonCard, SkeletonHero } from '@/components/SkeletonCard';
import { Footer } from '@/components/Footer';
import { CategoryNav } from '@/components/CategoryNav';
import { useArticles, type Article } from '@/hooks/useArticles';
import { usePageViewTracking } from '@/hooks/useAnalytics';

const ARTICLES_PER_PAGE = 8;

const Index = () => {
  const { featuredArticle, regularArticles, loading, error, refetch } = useArticles();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);
  
  // Track page views
  usePageViewTracking(location.pathname);
  
  const categoryFilter = searchParams.get('category');

  // Filter articles by category if specified
  const filteredArticles = categoryFilter && categoryFilter !== 'all' && categoryFilter !== 'trending'
    ? regularArticles.filter(article => 
        article.topic === categoryFilter || 
        article.tags.includes(categoryFilter)
      )
    : regularArticles;

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + ARTICLES_PER_PAGE);
  };

  // Show error state if Supabase fails
  if (error) {
    console.error('Failed to load articles:', error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatusBar />
      <Header />
      
      <main className="flex-1">
        {/* Category Navigation */}
        <section className="container mt-6">
          <CategoryNav variant="horizontal" />
        </section>
        
        {/* Featured Hero */}
        <section className="container mt-6">
          {loading || !featuredArticle ? (
            <SkeletonHero />
          ) : (
            <FeaturedHero article={featuredArticle} />
          )}
        </section>
        
        {/* Main Content Grid */}
        <section className="container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Articles Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="terminal-text text-foreground font-medium">
                  {categoryFilter && categoryFilter !== 'all' 
                    ? `${categoryFilter} Stories` 
                    : 'Latest Stories'}
                </h2>
                <span className="terminal-text text-muted-foreground">
                  {loading ? '...' : `${filteredArticles.length} articles`}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : displayedArticles.length > 0 ? (
                  displayedArticles.map((article: Article, index: number) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center">
                    <p className="text-muted-foreground">
                      {categoryFilter 
                        ? `No articles in ${categoryFilter} yet. Check back soon!`
                        : 'No articles yet. Check back soon!'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 border border-border-strong hover:bg-card-hover transition-colors font-mono text-sm uppercase tracking-wider"
                  >
                    Load More Articles
                  </button>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Sidebar suggestedArticles={regularArticles} />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
