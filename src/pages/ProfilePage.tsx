import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bookmark, 
  Clock, 
  LogOut, 
  Mail, 
  Bell,
  User,
  Loader2
} from 'lucide-react';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useReadingHistory } from '@/hooks/useReadingHistory';

// Simple article display component
function SimpleArticleCard({ article }: { article: { id: string; title: string; original_url: string; published_at?: string } }) {
  return (
    <a 
      href={article.original_url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors"
    >
      <h3 className="font-medium line-clamp-2">{article.title}</h3>
      {article.published_at && (
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(article.published_at).toLocaleDateString()}
        </p>
      )}
    </a>
  );
}

export function ProfilePage() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [updating, setUpdating] = useState(false);
  
  const { 
    articles: savedArticles, 
    loading: savedLoading,
    fetchSavedArticles 
  } = useSavedArticles();
  
  const { 
    articles: historyArticles, 
    loading: historyLoading,
    clearHistory,
    fetchReadingHistory
  } = useReadingHistory();

  useEffect(() => {
    if (user) {
      fetchSavedArticles();
      fetchReadingHistory();
    }
  }, [user, fetchSavedArticles, fetchReadingHistory]);

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="container py-8 text-center"
      >
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </motion.div>
    );
  }

  const userInitials = user.email?.split('@')[0]?.slice(0, 2).toUpperCase() || 'U';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container py-8 max-w-4xl"
    >
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="text-2xl bg-foreground text-background">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">
            {profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mb-2">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" onClick={signOut} disabled={authLoading}>
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Sign Out
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Saved Articles</span>
          </div>
          <p className="text-2xl font-semibold">{savedArticles.length}</p>
        </div>
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Reading History</span>
          </div>
          <p className="text-2xl font-semibold">{historyArticles.length}</p>
        </div>
        <div className="p-4 border border-border rounded-lg bg-card md:col-span-1 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Account Status</span>
          </div>
          <p className="text-2xl font-semibold">Active</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved Articles
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Reading History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {savedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : savedArticles.length > 0 ? (
            <div className="space-y-4">
              {savedArticles.map((article) => (
                <SimpleArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No saved articles yet</p>
              <p className="text-sm">Save articles from your feed to see them here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : historyArticles.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>
              {historyArticles.map((article) => (
                <SimpleArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reading history yet</p>
              <p className="text-sm">Articles you read will appear here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Email Digest */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base">Daily Email Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of top stories in your inbox
                  </p>
                </div>
              </div>
              <Switch disabled />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base">Breaking News Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about major breaking news
                  </p>
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
