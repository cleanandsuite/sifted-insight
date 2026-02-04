import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, BarChart3, Target } from 'lucide-react';
import type { ArticleSummary } from '@/data/mockArticles';

interface SummaryTabsProps {
  summaryTabs: ArticleSummary;
}

export const SummaryTabs = ({ summaryTabs }: SummaryTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="border border-border-strong bg-card mb-8"
    >
      <Tabs defaultValue="keypoints" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border-strong bg-muted/50 p-0 h-auto">
          <TabsTrigger 
            value="keypoints" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-mono text-sm gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Key Points
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-mono text-sm gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="takeaways" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-mono text-sm gap-2"
          >
            <Target className="w-4 h-4" />
            Takeaways
          </TabsTrigger>
        </TabsList>
        
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
        
        <TabsContent value="analysis" className="p-6 mt-0">
          <p className="text-foreground leading-relaxed">{summaryTabs.analysis}</p>
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
