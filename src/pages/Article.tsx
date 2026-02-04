import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBar } from '@/components/StatusBar';
import { Header } from '@/components/Header';
import { SourceCredits } from '@/components/SourceCredits';
import { ReadTimeComparison } from '@/components/ReadTimeComparison';
import { NativeAd } from '@/components/NativeAd';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { SummaryTabs } from '@/components/SummaryTabs';
import { getArticleById, getRegularArticles } from '@/data/mockArticles';

const Article = () => {
  const { id } = useParams<{ id: string }>();
  const article = id ? getArticleById(id) : undefined;
  const suggestedArticles = getRegularArticles().filter(a => a.id !== id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StatusBar />
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link to="/" className="text-primary hover:underline">
            ← Back to Feed
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StatusBar />
      <Header />
      
      <main className="flex-1">
        <div className="container mt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1 max-w-3xl">
              {/* Back Link */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 terminal-text hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Feed
                </Link>
              </motion.div>
              
              {/* Article Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                {/* Tags */}
                <div className="flex items-center gap-3 mb-4">
                  {article.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
                  {article.originalTitle}
                </h1>
                
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border-strong">
                  <span className="terminal-text">{article.sourcePublication}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="terminal-text text-muted-foreground">{formattedDate}</span>
                  <span className="text-muted-foreground">•</span>
                  <ReadTimeComparison 
                    original={article.originalReadTime} 
                    sifted={article.siftedReadTime} 
                  />
                </div>
              </motion.header>
              
              {/* Summary Tabs */}
              <SummaryTabs summaryTabs={article.summaryTabs} />
              
              {/* Media */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="border border-border-strong">
                  <img
                    src={article.mediaUrl}
                    alt={article.originalTitle}
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  Media scraped from original article
                </p>
              </motion.div>
              
              {/* Source Credits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <SourceCredits
                  author={article.originalAuthor}
                  publication={article.sourcePublication}
                  sourceUrl={article.sourceUrl}
                />
              </motion.div>
              
              {/* Native Ad */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <NativeAd />
              </motion.div>
            </article>
            
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Sidebar suggestedArticles={suggestedArticles} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Article;
