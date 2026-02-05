import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAnalytics, useRecentEvents } from '@/hooks/useAdminAnalytics';
 import { AdminNav } from '@/components/admin/AdminNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrapeControlCard } from '@/components/admin/ScrapeControlCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Eye, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Activity
} from 'lucide-react';

const COLORS = ['#0066FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: analytics, isLoading: analyticsLoading, refetch } = useAdminAnalytics();
  const { data: recentEvents, isLoading: eventsLoading } = useRecentEvents(20);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
       <AdminNav
         displayName={profile?.display_name}
         email={user.email}
         onSignOut={handleSignOut}
       />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Scrape Control */}
        <div className="mb-8">
          <ScrapeControlCard onScrapeComplete={refetch} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Page Views"
            value={analytics?.totalPageViews || 0}
            icon={<Eye className="w-6 h-6" />}
            loading={analyticsLoading}
          />
          <StatsCard
            title="Unique Visitors"
            value={analytics?.totalUniqueVisitors || 0}
            icon={<Users className="w-6 h-6" />}
            loading={analyticsLoading}
          />
          <StatsCard
            title="Article Reads"
            value={analytics?.totalArticleReads || 0}
            icon={<BookOpen className="w-6 h-6" />}
            loading={analyticsLoading}
          />
          <StatsCard
            title="Avg. Read Time"
            value={`${Math.floor((analytics?.avgReadTime || 0) / 60)}m ${(analytics?.avgReadTime || 0) % 60}s`}
            icon={<Clock className="w-6 h-6" />}
            loading={analyticsLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend Chart */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="flex items-center gap-2 font-black">
                <TrendingUp className="w-5 h-5 text-primary" />
                Daily Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {analyticsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.dailyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="views" stroke="#0066FF" strokeWidth={2} name="Page Views" />
                    <Line type="monotone" dataKey="reads" stroke="#00C49F" strokeWidth={2} name="Article Reads" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Topic Distribution */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="font-black">Topic Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {analyticsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.topTopics || []}
                      dataKey="count"
                      nameKey="topic"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(analytics?.topTopics || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Articles & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Articles */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="font-black">Top Articles</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {analyticsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(analytics?.topArticles || []).slice(0, 5).map((article, index) => (
                    <div 
                      key={article.id}
                      className="flex items-center gap-3 p-3 bg-muted border-2 border-black"
                    >
                      <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold border-2 border-black">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.count} views</p>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.topArticles || analytics.topArticles.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">No data yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="font-black">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(recentEvents || []).map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center gap-3 p-2 border-b border-border last:border-0"
                    >
                      <EventIcon type={event.event_type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!recentEvents || recentEvents.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">No recent activity</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  loading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  loading: boolean;
}) => (
  <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-3xl font-black">{value}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border-2 border-black">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const EventIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'page_view':
      return <Eye className={iconClass} />;
    case 'article_read':
      return <BookOpen className={iconClass} />;
    case 'article_click':
      return <TrendingUp className={iconClass} />;
    case 'share':
      return <Activity className={iconClass} />;
    default:
      return <Activity className={iconClass} />;
  }
};

export default Dashboard;
