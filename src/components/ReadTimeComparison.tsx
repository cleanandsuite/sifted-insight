interface ReadTimeComparisonProps {
  original: number;
  sifted: number;
  variant?: 'default' | 'hero';
}

export const ReadTimeComparison = ({ original, sifted, variant = 'default' }: ReadTimeComparisonProps) => {
  const timeSaved = original - sifted;
  
  if (variant === 'hero') {
    return (
      <div className="font-mono text-xs">
        <span className="line-through text-white/50">{original} min</span>
        <span className="mx-2 text-white/30">→</span>
        <span className="text-primary font-medium">{sifted} min read</span>
        <span className="ml-2 text-white/50">({timeSaved} min saved)</span>
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
