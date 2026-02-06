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
  
  // Use the share-meta edge function URL for social sharing to get proper OG tags
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sifted-insight.lovable.app';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hqjszktwczdnyyomllzd.supabase.co';
  
  // For social sharing, use the edge function that serves proper OG meta tags
  const shareUrl = articleId 
    ? `${supabaseUrl}/functions/v1/share-meta?id=${articleId}`
    : (url || (typeof window !== 'undefined' ? window.location.href : ''));
  
  // For copying to clipboard, use the actual article URL
  const clipboardUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
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
      await navigator.clipboard.writeText(clipboardUrl);
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
