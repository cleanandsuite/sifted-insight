import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { Header } from '@/components/Header';
import { FeaturedHero } from '@/components/FeaturedHero';
import { ArticleCard } from '@/components/ArticleCard';
import { Sidebar } from '@/components/Sidebar';
import { SkeletonCard, SkeletonHero } from '@/components/SkeletonCard';
import { Footer } from '@/components/Footer';
import { getFeaturedArticle, getRegularArticles } from '@/data/mockArticles';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const featuredArticle = getFeaturedArticle();
  const regularArticles = getRegularArticles();
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatusBar />
      <Header />
      
      <main className="flex-1">
        {/* Featured Hero */}
        <section className="container mt-6">
          {isLoading ? (
            <SkeletonHero />
          ) : (
            featuredArticle && <FeaturedHero article={featuredArticle} />
          )}
        </section>
        
        {/* Main Content Grid */}
        <section className="container mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Articles Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="terminal-text text-foreground font-medium">Latest Stories</h2>
                <span className="terminal-text text-muted-foreground">
                  {regularArticles.length} articles
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  regularArticles.map((article, index) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      index={index}
                    />
                  ))
                )}
              </div>
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
