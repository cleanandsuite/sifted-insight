import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
 
type ContentCategory = 'tech' | 'finance' | 'politics' | 'climate' | 'video_games';
type ScrapeCategory = 'all' | ContentCategory;

const CATEGORIES: Array<{ value: ScrapeCategory; label: string }> = [
  { value: 'all', label: 'All Sources' },
  { value: 'tech', label: 'Tech' },
  { value: 'video_games', label: 'Video Games' },
  { value: 'finance', label: 'Finance' },
  { value: 'politics', label: 'Politics' },
  { value: 'climate', label: 'Climate' },
];

interface ScrapeResult {
  source: string;
   category: ContentCategory | null;
  articlesFound: number;
  articlesAdded: number;
}

 interface CategoryBreakdown {
   tech: number;
   video_games: number;
   finance: number;
   politics: number;
   climate: number;
 }
 
interface ScrapeControlCardProps {
  onScrapeComplete?: () => void;
}

export const ScrapeControlCard = ({ onScrapeComplete }: ScrapeControlCardProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ScrapeCategory>('all');
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapePhase, setScrapePhase] = useState('');
  const [lastResults, setLastResults] = useState<ScrapeResult[] | null>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);
   const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);

  const handleScrape = async () => {
    setIsScraping(true);
    setProgress(0);
    setScrapePhase('Initializing...');
    setLastResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        setIsScraping(false);
        return;
      }

      // Simulate progress while waiting for response
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 90);
        });
        setScrapePhase((prev) => {
          const phases = [
            'Connecting to sources...',
            'Fetching RSS feeds...',
            'Processing articles...',
            'Extracting content...',
            'Classifying categories...',
          ];
          const currentIndex = phases.indexOf(prev);
          if (currentIndex < phases.length - 1) {
            return phases[currentIndex + 1] || phases[0];
          }
          return prev;
        });
      }, 3000);

      setScrapePhase('Connecting to sources...');

      // Set a timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category: selectedCategory }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        clearInterval(progressInterval);

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        setScrapePhase('Complete!');
        setLastResults(result.results || []);
        setLastScrapeTime(new Date());
         setCategoryBreakdown(result.categoryBreakdown || null);
        toast.success(`Scraping complete! Added ${result.totalArticlesAdded} articles`);
        onScrapeComplete?.();
        } else {
          setProgress(0);
          setScrapePhase('Failed');
          toast.error(result.error || 'Scraping failed');
        }
      } catch (fetchError) {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          setProgress(100);
          setScrapePhase('Request timed out - check results');
          toast.warning('Request timed out but scraping may still be processing. Check results in a moment.');
          onScrapeComplete?.();
        } else {
          setProgress(0);
          setScrapePhase('Error occurred');
          toast.error('Failed to trigger scrape');
        }
      }
    } catch (error) {
      setProgress(0);
      setScrapePhase('Error occurred');
      toast.error('Failed to authenticate');
    } finally {
      setIsScraping(false);
    }
  };

  const totalArticlesAdded = lastResults?.reduce((sum, r) => sum + r.articlesAdded, 0) || 0;

  return (
    <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="border-b-2 border-black">
        <CardTitle className="flex items-center gap-2 font-black">
          <RefreshCw className={cn("w-5 h-5 text-primary", isScraping && "animate-spin")} />
          Scrape Control
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Category Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as ScrapeCategory)}
            disabled={isScraping}
          >
            <SelectTrigger className="border-2 border-black">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Bar */}
        {(isScraping || progress > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{scrapePhase}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 border-2 border-black" />
          </div>
        )}

        {/* Scrape Button */}
        <Button
          onClick={handleScrape}
          disabled={isScraping}
          className="w-full border-2 border-black font-bold h-12"
        >
          {isScraping ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Scrape Now
            </>
          )}
        </Button>

        {/* Last Scrape Info */}
        {lastScrapeTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last run: {lastScrapeTime.toLocaleTimeString()}</span>
          </div>
        )}
 
       {/* Category Breakdown */}
       {categoryBreakdown && totalArticlesAdded > 0 && (
         <div className="grid grid-cols-5 gap-2 pt-2 border-t-2 border-black">
           {(['tech', 'video_games', 'finance', 'politics', 'climate'] as ContentCategory[]).map((cat) => (
             <div key={cat} className="text-center p-2 bg-muted border border-black">
               <div className="text-lg font-bold">
                 {categoryBreakdown[cat] || 0}
               </div>
               <div className="text-xs capitalize text-muted-foreground">
                 {cat === 'video_games' ? 'Games' : cat}
               </div>
             </div>
           ))}
         </div>
       )}

        {/* Results Summary */}
        {lastResults && lastResults.length > 0 && (
          <div className="space-y-3 pt-2 border-t-2 border-black">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-bold">
                {totalArticlesAdded} articles added
              </span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {lastResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between text-sm p-2 bg-muted border border-black"
                >
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                     <span className="font-medium truncate">{result.source}</span>
                     {result.category && (
                       <span className={cn(
                         "text-xs px-1.5 py-0.5 rounded border border-black",
                         result.category === 'tech' ? 'bg-primary/10 text-primary' :
                         result.category === 'finance' ? 'bg-emerald-500/10 text-emerald-600' :
                         result.category === 'politics' ? 'bg-violet-500/10 text-violet-600' :
                         'bg-green-500/10 text-green-600'
                       )}>
                         {result.category}
                       </span>
                     )}
                   </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{result.articlesFound} found</span>
                    <span>•</span>
                    <span className={result.articlesAdded > 0 ? 'text-primary font-medium' : ''}>
                      {result.articlesAdded} added
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {scrapePhase === 'Failed' && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Scraping failed. Please try again.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
