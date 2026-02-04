export const SkeletonCard = () => {
  return (
    <div className="border border-border-strong bg-card">
      {/* Image skeleton */}
      <div className="aspect-video skeleton-shimmer border-b border-border-strong" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        {/* Source & Tags */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 skeleton-shimmer" />
          <div className="h-5 w-12 skeleton-shimmer" />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full skeleton-shimmer" />
          <div className="h-5 w-3/4 skeleton-shimmer" />
        </div>
        
        {/* Summary */}
        <div className="space-y-2">
          <div className="h-4 w-full skeleton-shimmer" />
          <div className="h-4 w-full skeleton-shimmer" />
          <div className="h-4 w-2/3 skeleton-shimmer" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="h-3 w-24 skeleton-shimmer" />
          <div className="h-3 w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonHero = () => {
  return (
    <div className="w-full aspect-[21/9] skeleton-shimmer border border-border-strong" />
  );
};
