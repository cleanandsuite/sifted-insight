 import { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { Sparkles, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
 import { toast } from 'sonner';
 import { supabase } from '@/integrations/supabase/client';
 import { cn } from '@/lib/utils';
 
 interface BulkSummarizeCardProps {
   pendingCount: number;
   onComplete?: () => void;
 }
 
 interface BatchResult {
   success: boolean;
   provider?: string;
   model?: string;
   processed?: number;
   succeeded?: number;
   failed?: number;
   message?: string;
   error?: string;
 }
 
 export const BulkSummarizeCard = ({ pendingCount, onComplete }: BulkSummarizeCardProps) => {
   const [isProcessing, setIsProcessing] = useState(false);
   const [progress, setProgress] = useState(0);
   const [lastResult, setLastResult] = useState<BatchResult | null>(null);
   const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
 
   const handleBulkSummarize = async () => {
     if (pendingCount === 0) {
       toast.info('No pending articles to summarize');
       return;
     }
 
     setIsProcessing(true);
     setProgress(0);
     setLastResult(null);
 
     try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         toast.error('Not authenticated');
         setIsProcessing(false);
         return;
       }
 
       // Simulate progress while waiting
       const progressInterval = setInterval(() => {
         setProgress((prev) => Math.min(prev + 5, 90));
       }, 1000);
 
       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batch-summarize`,
         {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${session.access_token}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ limit: 20 }),
         }
       );
 
       clearInterval(progressInterval);
 
       const result: BatchResult = await response.json();
 
       if (result.success) {
         setProgress(100);
         setLastResult(result);
         setLastRunTime(new Date());
         
         if (result.processed === 0) {
           toast.info(result.message || 'No articles to process');
         } else {
           toast.success(`Processed ${result.succeeded}/${result.processed} articles`);
         }
         onComplete?.();
       } else {
         setProgress(0);
         toast.error(result.error || 'Batch summarization failed');
       }
     } catch (error) {
       setProgress(0);
       toast.error('Failed to trigger batch summarization');
     } finally {
       setIsProcessing(false);
     }
   };
 
   return (
     <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardHeader className="border-b-2 border-black">
         <CardTitle className="flex items-center gap-2 font-black">
           <Sparkles className={cn("w-5 h-5 text-primary", isProcessing && "animate-pulse")} />
           Bulk Summarize
         </CardTitle>
       </CardHeader>
       <CardContent className="pt-6 space-y-4">
         {/* Pending Count */}
         <div className="flex items-center justify-between p-3 bg-muted border-2 border-black">
           <span className="font-medium">Pending Articles</span>
           <span className={cn(
             "text-2xl font-black",
             pendingCount > 0 ? "text-destructive" : "text-primary"
           )}>
             {pendingCount}
           </span>
         </div>
 
         {/* Progress Bar */}
         {(isProcessing || progress > 0) && (
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">
                 {isProcessing ? 'Processing with MiniMax M2.1...' : 'Complete'}
               </span>
               <span className="font-medium">{Math.round(progress)}%</span>
             </div>
             <Progress value={progress} className="h-3 border-2 border-black" />
           </div>
         )}
 
         {/* Summarize Button */}
         <Button
           onClick={handleBulkSummarize}
           disabled={isProcessing || pendingCount === 0}
           className="w-full border-2 border-black font-bold h-12"
         >
           {isProcessing ? (
             <>
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               Summarizing...
             </>
           ) : (
             <>
               <Sparkles className="w-4 h-4 mr-2" />
               Summarize {Math.min(pendingCount, 20)} Articles
             </>
           )}
         </Button>
 
         {/* Last Run Info */}
         {lastRunTime && (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Clock className="w-4 h-4" />
             <span>Last run: {lastRunTime.toLocaleTimeString()}</span>
           </div>
         )}
 
         {/* Results Summary */}
         {lastResult && lastResult.processed !== undefined && lastResult.processed > 0 && (
           <div className="space-y-3 pt-2 border-t-2 border-black">
             <div className="flex items-center gap-2">
               <CheckCircle className="w-5 h-5 text-primary" />
               <span className="font-bold">
                 {lastResult.succeeded} summarized via {lastResult.model}
               </span>
             </div>
             {lastResult.failed !== undefined && lastResult.failed > 0 && (
               <div className="flex items-center gap-2 text-destructive">
                 <AlertCircle className="w-4 h-4" />
                 <span className="text-sm">{lastResult.failed} failed</span>
               </div>
             )}
           </div>
         )}
 
         {/* Help text */}
         <p className="text-xs text-muted-foreground">
           Processes up to 20 pending articles in parallel using your MiniMax M2.1 API key for faster summarization.
         </p>
       </CardContent>
     </Card>
   );
 };