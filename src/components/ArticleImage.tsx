 import { useState } from 'react';
 import { Globe } from 'lucide-react';
 
 interface ArticleImageProps {
   src: string | null | undefined;
   alt: string;
   source: string;
   category?: string | null;
   className?: string;
   variant?: 'card' | 'hero';
   articleId?: string;
 }
 
 // Source brand colors for fallback backgrounds
 const sourceColors: Record<string, { bg: string; accent: string }> = {
   'TechCrunch': { bg: 'from-green-900/90 to-green-950', accent: 'bg-green-600' },
   'The Verge': { bg: 'from-pink-900/90 to-pink-950', accent: 'bg-pink-600' },
   'Wired': { bg: 'from-zinc-800/90 to-zinc-900', accent: 'bg-zinc-600' },
   'Ars Technica': { bg: 'from-orange-900/90 to-orange-950', accent: 'bg-orange-600' },
   'MIT Technology Review': { bg: 'from-red-900/90 to-red-950', accent: 'bg-red-600' },
   'Bloomberg': { bg: 'from-blue-900/90 to-blue-950', accent: 'bg-blue-600' },
   'Reuters': { bg: 'from-orange-800/90 to-orange-900', accent: 'bg-orange-500' },
   'CNBC': { bg: 'from-blue-900/90 to-blue-950', accent: 'bg-blue-500' },
   'Politico': { bg: 'from-red-900/90 to-red-950', accent: 'bg-red-500' },
   'The Hill': { bg: 'from-blue-900/90 to-blue-950', accent: 'bg-blue-600' },
   'BBC Politics': { bg: 'from-red-900/90 to-red-950', accent: 'bg-red-700' },
   'Inside Climate News': { bg: 'from-emerald-900/90 to-emerald-950', accent: 'bg-emerald-600' },
   'Yale E360': { bg: 'from-teal-900/90 to-teal-950', accent: 'bg-teal-600' },
   'Grist': { bg: 'from-lime-900/90 to-lime-950', accent: 'bg-lime-600' },
   'The Guardian': { bg: 'from-blue-900/90 to-blue-950', accent: 'bg-blue-700' },
 };
 
 const getSourceColors = (source: string) => {
   return sourceColors[source] || { bg: 'from-primary/20 to-primary/40', accent: 'bg-primary' };
 };
 
export const ArticleImage = ({ 
  src, 
  alt, 
  source, 
  category,
  className = '',
  variant = 'card',
  articleId
}: ArticleImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useGeneratedImage, setUseGeneratedImage] = useState(false);
  
  const showFallback = (!src || hasError) && !useGeneratedImage;
  const colors = getSourceColors(source);
  const initial = source.charAt(0).toUpperCase();
  
  // If we have an articleId and no image, try the generated image
  const generatedImageUrl = articleId 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article-image?id=${articleId}`
    : null;
  
  // When original image fails and we have a generated image URL, try it
  const handleError = () => {
    if (!useGeneratedImage && generatedImageUrl) {
      setUseGeneratedImage(true);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };
  
  const imageSrc = useGeneratedImage ? generatedImageUrl : src;
   
   if (showFallback) {
     return (
       <div 
         className={`relative w-full h-full bg-gradient-to-br ${colors.bg} flex flex-col items-center justify-center ${className}`}
       >
         {/* Grid pattern overlay */}
         <div 
           className="absolute inset-0 opacity-10"
           style={{
             backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                               linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
           }}
         />
         
         {/* Source icon */}
         <div 
           className={`${colors.accent} w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3`}
         >
           {source === 'Unknown Source' ? (
             <Globe className="w-6 h-6 md:w-8 md:h-8 text-white" />
           ) : (
             <span className="font-mono font-bold text-xl md:text-2xl text-white">
               {initial}
             </span>
           )}
         </div>
         
         {/* Source name */}
         <span className="font-mono text-xs md:text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
           {source}
         </span>
         
         {/* Category tag */}
         {category && (
           <span className="tag-accent text-[10px] md:text-xs">
             {category}
           </span>
         )}
       </div>
     );
   }
   
  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}
      <img
        src={imageSrc || ''}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    </div>
  );
};