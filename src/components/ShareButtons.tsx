import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ShareButtonsProps {
  title: string;
  url?: string;
  articleId?: string;
}

export const ShareButtons = ({ title, url, articleId }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { trackShare } = useAnalytics();
  
  // For social platforms that need server-rendered OG tags, use the share-meta edge function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hqjszktwczdnyyomllzd.supabase.co';
  const siteUrl = 'https://nooz.news';
  
  // Share-meta URL for crawlers (Facebook, LinkedIn) - serves server-rendered OG tags
  const shareMetaUrl = articleId 
    ? `${supabaseUrl}/functions/v1/share-meta?id=${articleId}`
    : (url || (typeof window !== 'undefined' ? window.location.href : ''));
  
  // Direct article URL for Twitter (handles client-side meta better)
  const directUrl = articleId 
    ? `${siteUrl}/article/${articleId}`
    : (url || (typeof window !== 'undefined' ? window.location.href : ''));
  
  const encodedShareMetaUrl = encodeURIComponent(shareMetaUrl);
  const encodedDirectUrl = encodeURIComponent(directUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      // Twitter handles client-side meta tags better, use direct URL
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedDirectUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      // Facebook needs server-rendered OG tags, use share-meta endpoint
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareMetaUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      // LinkedIn needs server-rendered OG tags, use share-meta endpoint
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedShareMetaUrl}&title=${encodedTitle}`,
    },
  ];

  const handleShare = (platform: string, shareLink: string) => {
    if (articleId) {
      trackShare(articleId, platform.toLowerCase());
    }
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied(true);
      if (articleId) {
        trackShare(articleId, 'copy_link');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="terminal-text text-muted-foreground mr-2">Share</span>
      {shareLinks.map((link) => {
        const Icon = link.icon;
        return (
          <button
            key={link.name}
            onClick={() => handleShare(link.name, link.url)}
            className="p-2 border border-border-strong hover:bg-card-hover transition-colors"
            aria-label={`Share on ${link.name}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
      <button
        onClick={copyToClipboard}
        className="p-2 border border-border-strong hover:bg-card-hover transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
