 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useContentMix, ContentCategory } from '@/hooks/useContentMix';
 import { AlertTriangle, TrendingUp, TrendingDown, Minus, PieChart } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const CATEGORY_COLORS: Record<ContentCategory, { bg: string; text: string }> = {
   tech: { bg: 'bg-primary/10', text: 'text-primary' },
   finance: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
   politics: { bg: 'bg-violet-500/10', text: 'text-violet-600' },
   climate: { bg: 'bg-green-500/10', text: 'text-green-600' },
 };
 
 const CATEGORY_LABELS: Record<ContentCategory, string> = {
   tech: 'Tech',
   finance: 'Finance',
   politics: 'Politics',
   climate: 'Climate',
 };
 
 export function ContentMixCard() {
   const { data, isLoading, error } = useContentMix();
   
   if (isLoading) {
     return (
       <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
         <CardHeader className="border-b-2 border-black">
           <CardTitle className="flex items-center gap-2 font-black">
             <PieChart className="w-5 h-5" />
             Content Mix
           </CardTitle>
         </CardHeader>
         <CardContent className="pt-6">
           <div className="animate-pulse space-y-4">
             <div className="h-8 bg-muted rounded" />
             <div className="h-24 bg-muted rounded" />
           </div>
         </CardContent>
       </Card>
     );
   }
   
   if (error || !data) {
     return (
       <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
         <CardHeader className="border-b-2 border-black">
           <CardTitle className="flex items-center gap-2 font-black">
             <PieChart className="w-5 h-5" />
             Content Mix
           </CardTitle>
         </CardHeader>
         <CardContent className="pt-6">
           <p className="text-destructive">Failed to load content mix data</p>
         </CardContent>
       </Card>
     );
   }
   
   const techPercent = Math.round(data.techRatio * 100);
   const otherPercent = 100 - techPercent;
   
   return (
     <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardHeader className="border-b-2 border-black">
         <CardTitle className="flex items-center justify-between font-black">
           <div className="flex items-center gap-2">
             <PieChart className="w-5 h-5 text-primary" />
             Content Mix
           </div>
           {data.deviationAlert && (
             <Badge variant="outline" className="border-amber-500 text-amber-500">
               <AlertTriangle className="w-3 h-3 mr-1" />
               Deviation Alert
             </Badge>
           )}
         </CardTitle>
       </CardHeader>
       <CardContent className="pt-6 space-y-6">
         {/* Main ratio display */}
         <div className="text-center">
           <div className="text-3xl font-black">
             <span className="text-primary">{techPercent}%</span>
             <span className="text-muted-foreground mx-2">/</span>
             <span>{otherPercent}%</span>
           </div>
           <p className="text-sm text-muted-foreground mt-1">
             Tech / Other (Target: 68% / 32%)
           </p>
         </div>
         
         {/* Progress bar */}
         <div className="space-y-2">
           <div className="flex h-6 w-full overflow-hidden rounded border-2 border-black">
             {data.distribution.map((item) => (
               <div
                 key={item.category}
                 className={cn(
                   "flex items-center justify-center text-xs font-bold text-white",
                   item.category === 'tech' ? 'bg-primary' :
                   item.category === 'finance' ? 'bg-emerald-500' :
                   item.category === 'politics' ? 'bg-violet-500' : 'bg-green-500'
                 )}
                 style={{ width: `${Math.max(item.ratio * 100, 5)}%` }}
               >
                 {item.ratio >= 0.08 && `${Math.round(item.ratio * 100)}%`}
               </div>
             ))}
           </div>
         </div>
         
         {/* Category breakdown */}
         <div className="grid grid-cols-2 gap-3">
           {data.distribution.map((item) => {
             const colors = CATEGORY_COLORS[item.category];
             const deviationPercent = Math.round(item.deviation * 100);
             const isOnTarget = Math.abs(deviationPercent) <= 5;
             
             return (
               <div
                 key={item.category}
                 className={cn(
                   "p-3 rounded border-2 border-black",
                   colors.bg
                 )}
               >
                 <div className="flex items-center justify-between mb-1">
                   <span className={cn("font-bold", colors.text)}>
                     {CATEGORY_LABELS[item.category]}
                   </span>
                   {isOnTarget ? (
                     <Minus className="w-4 h-4 text-muted-foreground" />
                   ) : item.isUnderrepresented ? (
                     <TrendingDown className="w-4 h-4 text-amber-500" />
                   ) : (
                     <TrendingUp className="w-4 h-4 text-amber-500" />
                   )}
                 </div>
                 <div className="text-2xl font-black">
                   {Math.round(item.ratio * 100)}%
                 </div>
                 <div className="text-xs text-muted-foreground">
                   Target: {Math.round(item.targetRatio * 100)}%
                   {!isOnTarget && (
                     <span className={item.isUnderrepresented ? 'text-red-500' : 'text-amber-500'}>
                       {' '}({deviationPercent > 0 ? '+' : ''}{deviationPercent}%)
                     </span>
                   )}
                 </div>
                 <div className="text-xs text-muted-foreground mt-1">
                   {item.count} articles
                 </div>
               </div>
             );
           })}
         </div>
         
         {/* Total articles */}
         <div className="text-center text-sm text-muted-foreground border-t-2 border-black pt-4">
           Total: {data.totalArticles} articles in the last 7 days
         </div>
       </CardContent>
     </Card>
   );
 }