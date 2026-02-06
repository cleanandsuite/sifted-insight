import { Globe } from 'lucide-react';

interface SourceBadgeProps {
  source: string;
  size?: 'sm' | 'md';
}

// Map of source names to their brand colors (simplified)
const sourceColors: Record<string, string> = {
  'TechCrunch': 'bg-green-600',
  'The Verge': 'bg-purple-600',
  'Ars Technica': 'bg-orange-600',
  'Wired': 'bg-black dark:bg-white dark:text-black',
  'MIT Technology Review': 'bg-red-600',
  'Bloomberg': 'bg-blue-600',
  'Reuters': 'bg-orange-500',
  'The New York Times': 'bg-black dark:bg-white dark:text-black',
  'Wall Street Journal': 'bg-black dark:bg-white dark:text-black',
};

export const SourceBadge = ({ source, size = 'sm' }: SourceBadgeProps) => {
  const colorClass = sourceColors[source] || 'bg-muted';
  const initial = source.charAt(0).toUpperCase();
  
  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5 text-[10px]' 
    : 'w-6 h-6 text-xs';

  return (
    <div className="flex items-center gap-1.5 min-w-0 max-w-full">
      <div 
        className={`${sizeClasses} ${colorClass} text-white flex items-center justify-center font-mono font-bold flex-shrink-0`}
        title={source}
      >
        {source === 'Unknown Source' ? (
          <Globe className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        ) : (
          initial
        )}
      </div>
      <span className="terminal-text truncate max-w-[100px] sm:max-w-[140px]">{source}</span>
    </div>
  );
};
