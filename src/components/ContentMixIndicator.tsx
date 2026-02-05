 import { cn } from '@/lib/utils';
 import { useContentMix, ContentCategory } from '@/hooks/useContentMix';
 import { AlertTriangle } from 'lucide-react';
 
 const CATEGORY_COLORS: Record<ContentCategory, string> = {
   tech: 'bg-primary',
   finance: 'bg-emerald-500',
   politics: 'bg-violet-500',
   climate: 'bg-green-500',
 };
 
 const CATEGORY_LABELS: Record<ContentCategory, string> = {
   tech: 'Tech',
   finance: 'Finance',
   politics: 'Politics',
   climate: 'Climate',
 };
 
 interface ContentMixIndicatorProps {
   className?: string;
   showDetails?: boolean;
 }
 
 export function ContentMixIndicator({ className, showDetails = true }: ContentMixIndicatorProps) {
   const { data, isLoading } = useContentMix();
   
   if (isLoading || !data) {
     return (
       <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
         <div className="w-24 h-2 bg-muted animate-pulse rounded-full" />
         <span>Loading...</span>
       </div>
     );
   }
   
   const techPercent = Math.round(data.techRatio * 100);
   const otherPercent = 100 - techPercent;
   
   return (
     <div className={cn("space-y-2", className)}>
       {/* Header with alert if needed */}
       <div className="flex items-center gap-2 text-sm font-medium">
         <span>Content Mix: {techPercent}% Tech / {otherPercent}% Other</span>
         {data.deviationAlert && (
           <AlertTriangle className="w-4 h-4 text-amber-500" />
         )}
       </div>
       
       {/* Progress bar */}
       <div className="flex h-3 w-full overflow-hidden rounded-full border-2 border-black">
         {data.distribution.map((item) => (
           <div
             key={item.category}
             className={cn(CATEGORY_COLORS[item.category])}
             style={{ width: `${item.ratio * 100}%` }}
             title={`${CATEGORY_LABELS[item.category]}: ${Math.round(item.ratio * 100)}%`}
           />
         ))}
       </div>
       
       {/* Category breakdown */}
       {showDetails && (
         <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
           {data.distribution.map((item) => (
             <div key={item.category} className="flex items-center gap-1">
               <div className={cn("w-2 h-2 rounded-full", CATEGORY_COLORS[item.category])} />
               <span>
                 {CATEGORY_LABELS[item.category]}: {Math.round(item.ratio * 100)}%
                 <span className="opacity-60"> (target {Math.round(item.targetRatio * 100)}%)</span>
               </span>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 }