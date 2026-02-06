import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Bookmark } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

// Simple article display for saved articles
function SavedArticleCard({ 
  article, 
  onRemove 
}: { 
  article: { id: string; title: string; original_url: string; published_at?: string }; 
  onRemove: () => void;
}) {
  return (
    <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <a 
          href={article.original_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1"
        >
          <h3 className="font-medium line-clamp-2 hover:underline">{article.title}</h3>
          {article.published_at && (
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(article.published_at).toLocaleDateString()}
            </p>
          )}
        </a>
        <button 
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Remove from saved"
        >
          <Bookmark className="h-5 w-5 fill-current" />
        </button>
      </div>
    </div>
  );
}

export function SavedArticlesPage() {
  const { user, loading: authLoading } = useAuth();
  const { articles, loading, error, fetchSavedArticles, toggleSaved, isArticleSaved } = useSavedArticles();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch saved articles on mount
  useEffect(() => {
    if (user) {
      fetchSavedArticles();
    }
  }, [user, fetchSavedArticles]);

  if (authLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="container py-8 flex justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="container py-8 text-center"
      >
        <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-semibold mb-2">Sign in to view saved articles</h1>
        <p className="text-muted-foreground mb-6">
          Save articles to read later and access them across devices
        </p>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode="signin" />
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="container py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Saved Articles</h1>
        <p className="text-muted-foreground">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'} saved for later
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Error loading saved articles</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-4">
          {articles.map((article) => (
            <SavedArticleCard 
              key={article.id} 
              article={article}
              onRemove={() => toggleSaved(article.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No saved articles yet</p>
          <p className="text-sm mt-1">
            Tap the bookmark icon on any article to save it here
          </p>
        </div>
      )}
    </motion.div>
  );
}
