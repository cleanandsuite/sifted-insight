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

const CATEGORIES = [
  { value: 'all', label: 'All Sources' },
  { value: 'ai', label: 'AI & Tech' },
  { value: 'apple', label: 'Apple' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'climate', label: 'Climate' },
  { value: 'politics', label: 'Politics' },
  { value: 'finance', label: 'Finance' },
];

interface ScrapeResult {
  source: string;
  articlesFound: number;
  articlesAdded: number;
}

interface ScrapeControlCardProps {
  onScrapeComplete?: () => void;
}

export const ScrapeControlCard = ({ onScrapeComplete }: ScrapeControlCardProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapePhase, setScrapePhase] = useState('');
  const [lastResults, setLastResults] = useState<ScrapeResult[] | null>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);

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
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 90);
        });
        setScrapePhase((prev) => {
          const phases = [
            'Connecting to sources...',
            'Fetching RSS feeds...',
            'Processing articles...',
            'Extracting content...',
            'Summarizing with AI...',
          ];
          const currentIndex = phases.indexOf(prev);
          if (currentIndex < phases.length - 1) {
            return phases[currentIndex + 1] || phases[0];
          }
          return prev;
        });
      }, 2000);

      setScrapePhase('Connecting to sources...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-news`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: selectedCategory }),
        }
      );

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        setScrapePhase('Complete!');
        setLastResults(result.results || []);
        setLastScrapeTime(new Date());
        toast.success(`Scraping complete! Added ${result.totalArticlesAdded} articles`);
        onScrapeComplete?.();
      } else {
        setProgress(0);
        setScrapePhase('Failed');
        toast.error(result.error || 'Scraping failed');
      }
    } catch (error) {
      setProgress(0);
      setScrapePhase('Error occurred');
      toast.error('Failed to trigger scrape');
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
            onValueChange={setSelectedCategory}
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
                  <span className="font-medium truncate flex-1">{result.source}</span>
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
