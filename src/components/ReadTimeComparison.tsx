interface ReadTimeComparisonProps {
  original: number;
  sifted: number;
  variant?: 'default' | 'hero';
}

export const ReadTimeComparison = ({ original, sifted, variant = 'default' }: ReadTimeComparisonProps) => {
  const timeSaved = original - sifted;
  
  if (variant === 'hero') {
    return (
      <div className="font-mono text-[10px] sm:text-xs flex flex-wrap items-center gap-x-1">
        <span className="line-through text-white/50">{original}m</span>
        <span className="text-white/30">→</span>
        <span className="text-primary font-medium">{sifted}m</span>
        <span className="text-white/50 hidden sm:inline">({timeSaved}m saved)</span>
      </div>
    );
  }
  
  return (
    <div className="read-time-saved">
      <span className="original">{original} min</span>
      <span className="mx-1.5 text-muted-foreground">→</span>
      <span className="sifted">{sifted} min</span>
    </div>
  );
};
