import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, BarChart3, Target, Volume2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { ArticleSummary } from '@/data/mockArticles';

interface SummaryTabsProps {
  summaryTabs: ArticleSummary;
  articleTitle?: string;
}

export const SummaryTabs = ({ summaryTabs, articleTitle }: SummaryTabsProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTab, setCurrentTab] = useState('analysis');

  // Get the text content for TTS based on current tab
  const getTabText = useCallback(() => {
    switch (currentTab) {
      case 'analysis':
        return summaryTabs.analysis;
      case 'keypoints':
        return summaryTabs.keyPoints.join('. ');
      case 'takeaways':
        return summaryTabs.takeaways.join('. ');
      default:
        return summaryTabs.analysis;
    }
  }, [currentTab, summaryTabs]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(getTabText());
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  // Stop speaking when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="border border-border-strong bg-card mb-8"
    >
      <Tabs defaultValue="analysis" className="w-full" onValueChange={setCurrentTab}>
        <TabsList className="w-full justify-start rounded-none border-b border-border-strong bg-muted/50 p-0 h-auto">
          <TabsTrigger 
            value="analysis" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 sm:px-6 py-3 font-mono text-sm gap-1.5 sm:gap-2"
            title="Analysis"
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Analysis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="keypoints" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 sm:px-6 py-3 font-mono text-sm gap-1.5 sm:gap-2"
            title="Key Points"
          >
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Key Points</span>
          </TabsTrigger>
          <TabsTrigger 
            value="takeaways" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 sm:px-6 py-3 font-mono text-sm gap-1.5 sm:gap-2"
            title="Takeaways"
          >
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Takeaways</span>
          </TabsTrigger>
          
          {/* TTS Button - positioned to the right of Takeaways */}
          <button
            onClick={handleSpeak}
            className={`ml-auto mr-2 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
              isSpeaking 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={isSpeaking ? 'Stop listening' : 'Listen to this section'}
          >
            <Volume2 className={`w-4 h-4 flex-shrink-0 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline font-mono text-xs">{isSpeaking ? 'STOP' : 'LISTEN'}</span>
          </button>
        </TabsList>
        
        <TabsContent value="analysis" className="p-6 mt-0">
          <p className="text-foreground leading-relaxed">{summaryTabs.analysis}</p>
        </TabsContent>
        
        <TabsContent value="keypoints" className="p-6 mt-0">
          <ul className="space-y-3">
            {summaryTabs.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-mono text-primary text-sm mt-0.5">0{index + 1}</span>
                <span className="text-foreground leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        
        <TabsContent value="takeaways" className="p-6 mt-0">
          <ul className="space-y-3">
            {summaryTabs.takeaways.map((takeaway, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-primary">→</span>
                <span className="text-foreground leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
