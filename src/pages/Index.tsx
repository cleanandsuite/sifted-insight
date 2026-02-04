import { StatusBar } from '@/components/StatusBar';
import { Header } from '@/components/Header';
import { FeaturedHero } from '@/components/FeaturedHero';
import { ArticleCard } from '@/components/ArticleCard';
import { Sidebar } from '@/components/Sidebar';
import { SkeletonCard, SkeletonHero } from '@/components/SkeletonCard';
import { Footer } from '@/components/Footer';
import { useArticles, type Article } from '@/hooks/useArticles';

const Index = () => {
  const { featuredArticle, regularArticles, loading, error, refetch } = useArticles();

  // Show error state if Supabase fails
  if (error) {
    console.error('Failed to load articles:', error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatusBar />
      <Header />
      
      <main className="flex-1">
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
                <h2 className="terminal-text text-foreground font-medium">Latest Stories</h2>
                <span className="terminal-text text-muted-foreground">
                  {loading ? '...' : `${regularArticles.length} articles`}
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
                ) : regularArticles.length > 0 ? (
                  regularArticles.map((article: Article, index: number) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center">
                    <p className="text-muted-foreground">No articles yet. Check back soon!</p>
                  </div>
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
